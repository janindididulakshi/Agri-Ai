"""
Smart Farm MCP (stdio) — exposes lightweight helper tools for IDE/agents.

Run from repo root:
  cd backend && ..\\.venv\\Scripts\\python -m mcp_server.server
(or activate venv first).
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import CallToolResult, TextContent, Tool
except ImportError as e:  # pragma: no cover
    print("Install MCP SDK: pip install mcp", file=sys.stderr)
    raise SystemExit(1) from e

from services.ml_service import CROP_NAMES_SI, CROPS_EN

server = Server("smart-farm-ai")


@server.list_tools()
async def _list_tools() -> list[Tool]:
    return [
        Tool(
            name="crop_supported_classes",
            description="Crop labels supported by the XGBoost model (English + Sinhala).",
            inputSchema={"type": "object", "properties": {}, "additionalProperties": False},
        ),
        Tool(
            name="farming_system_prompt_stub",
            description="Shows season heuristic label used by AI prompts.",
            inputSchema={"type": "object", "properties": {}, "additionalProperties": False},
        ),
    ]


@server.call_tool()
async def _call_tool(name: str, arguments: dict | None) -> CallToolResult:
    _ = arguments
    if name == "crop_supported_classes":
        payload = [{"en": en, "si": CROP_NAMES_SI.get(en, en)} for en in CROPS_EN]
        return CallToolResult(content=[TextContent(type="text", text=json.dumps(payload, ensure_ascii=False))])
    if name == "farming_system_prompt_stub":
        from services.opencode_service import season_label

        return CallToolResult(content=[TextContent(type="text", text=json.dumps({"season": season_label()}))])
    raise ValueError(f"unknown tool {name}")


async def _run():
    async with stdio_server() as streams:
        await server.run(streams[0], streams[1], server.create_initialization_options())


def main():
    asyncio.run(_run())


if __name__ == "__main__":
    main()
