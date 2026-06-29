import asyncio
import json
import os
from pathlib import Path
from typing import AsyncGenerator


_COMMAND_PREAMBLES = {
    "query": (
        "You are operating in Query mode as defined in CLAUDE.md.\n"
        "Read wiki/index.md first, then answer the question below with "
        "evidence-tier citations [T1]–[T4]. Carry the not-medical-advice framing.\n\n"
        "Question: {input}"
    ),
    "ingest": (
        "You are operating in Ingest mode as defined in CLAUDE.md.\n"
        "Process the following source path or description. Follow the six-step "
        "ingest workflow exactly: assign tier, update relevant pages, update index.md, "
        "append log.md, flag if review-worthy.\n\n"
        "Source: {input}"
    ),
    "lint": (
        "You are operating in Lint mode as defined in CLAUDE.md.\n"
        "Perform a full health-check of the wiki/. Look for: T4 claims stated too "
        "confidently, unreconciled tier conflicts, superseded guidelines, missing "
        "cross-references, orphaned pages, and gaps a literature search could fill. "
        "Output suggested fixes — do not silently rewrite contested content.\n\n"
        "{input}"
    ),
    "review": (
        "You are operating in Review mode as defined in CLAUDE.md.\n"
        "{input}"
    ),
}


class ClaudeRunner:
    def __init__(self, repo_path: Path):
        self.repo_path = repo_path

    def _build_prompt(self, command: str, user_input: str) -> str:
        template = _COMMAND_PREAMBLES.get(command, "{input}")
        return template.format(input=user_input or "")

    async def stream(self, command: str, user_input: str) -> AsyncGenerator[str, None]:
        prompt = self._build_prompt(command, user_input)

        # Use the authenticated Claude Code session stored in ~/.claude/.
        # Strip ANTHROPIC_API_KEY so the CLI never falls back to a raw API key
        # instead of the logged-in credentials.
        env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}

        # Headless `claude -p` denies tools that need approval (Write/Edit/Bash)
        # by default, so ingest/lint can't modify files and query can't read them.
        # This runs on a trusted server whose whole job is letting Claude maintain
        # the wiki, so we grant tool access. Override with CLAUDE_PERMISSION_MODE
        # (default | acceptEdits | plan | bypassPermissions) to tighten it.
        perm_mode = os.environ.get("CLAUDE_PERMISSION_MODE", "").strip()
        perm_args = (
            ["--permission-mode", perm_mode]
            if perm_mode
            else ["--dangerously-skip-permissions"]
        )

        proc = await asyncio.create_subprocess_exec(
            "claude",
            "-p", prompt,
            "--output-format", "stream-json",
            "--verbose",
            *perm_args,
            cwd=str(self.repo_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        async for raw_line in proc.stdout:
            line = raw_line.decode(errors="replace").strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                yield line + "\n"
                continue

            etype = event.get("type")

            if etype == "assistant":
                for block in event.get("message", {}).get("content", []):
                    btype = block.get("type")
                    if btype == "text":
                        yield block["text"]
                    elif btype == "tool_use":
                        yield _format_tool_use(block)

            elif etype == "tool_result":
                pass  # skip raw tool results — the assistant text covers them

            elif etype == "result":
                if event.get("is_error"):
                    yield f"\n\n> **Error:** {event.get('error', 'Unknown error')}\n"

        await proc.wait()

        if proc.returncode and proc.returncode != 0:
            stderr = await proc.stderr.read()
            msg = stderr.decode(errors="replace").strip()
            if msg:
                yield f"\n\n> **Claude exited with code {proc.returncode}:** {msg[:500]}\n"


def _format_tool_use(block: dict) -> str:
    name = block.get("name", "tool")
    inp = block.get("input", {})
    if name == "Read":
        return f"\n_Reading `{inp.get('file_path', '...')}`…_\n"
    if name in ("Write", "Edit"):
        return f"\n_{'Writing' if name == 'Write' else 'Editing'} `{inp.get('file_path', '...')}`…_\n"
    if name == "Bash":
        cmd = (inp.get("command") or "")[:60]
        return f"\n_Running: `{cmd}`…_\n"
    return f"\n_Tool: {name}_\n"
