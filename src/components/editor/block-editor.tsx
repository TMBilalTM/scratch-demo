"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { useEditorStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

export interface BlockEditorHandle {
  getCode: () => string;
  getWorkspace: () => Blockly.WorkspaceSvg | null;
  getWorkspaceXml: () => string;
  loadWorkspaceXml: (xml: string) => void;
}

export const BlockEditor = forwardRef<BlockEditorHandle>((props, ref) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const { sprites, selectedSpriteId, selectSprite } = useEditorStore();

  useImperativeHandle(ref, () => ({
    getCode: () => {
      if (!workspace.current) return "";
      return javascriptGenerator.workspaceToCode(workspace.current);
    },
    getWorkspace: () => workspace.current,
    getWorkspaceXml: () => {
      if (!workspace.current) return "";
      const xml = Blockly.Xml.workspaceToDom(workspace.current);
      return Blockly.Xml.domToText(xml);
    },
    loadWorkspaceXml: (xml: string) => {
      if (!workspace.current || !xml) return;
      try {
        workspace.current.clear();
        const dom = Blockly.utils.xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, workspace.current);
      } catch (error) {
        console.error("Failed to load blocks:", error);
      }
    },
  }));

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Define custom blocks
    Blockly.Blocks["move_forward"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("move forward")
          .appendField(new Blockly.FieldNumber(10, 0), "STEPS")
          .appendField("steps");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Move sprite forward");
      },
    };

    Blockly.Blocks["turn"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("turn")
          .appendField(
            new Blockly.FieldDropdown([
              ["right", "RIGHT"],
              ["left", "LEFT"],
            ]),
            "DIRECTION"
          )
          .appendField(new Blockly.FieldNumber(15, 0), "DEGREES")
          .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Rotate sprite");
      },
    };

    Blockly.Blocks["say"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("say")
          .appendField(new Blockly.FieldTextInput("Hello!"), "TEXT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Display text");
      },
    };

    Blockly.Blocks["when_flag_clicked"] = {
      init: function () {
        this.appendDummyInput().appendField("when 🚩 clicked");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour(60);
        this.setTooltip("Run when green flag is clicked");
      },
    };

    // Initialize workspace
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Events",
            colour: "60",
            contents: [
              {
                kind: "block",
                type: "when_flag_clicked",
              },
            ],
          },
          {
            kind: "category",
            name: "Motion",
            colour: "230",
            contents: [
              {
                kind: "block",
                type: "move_forward",
              },
              {
                kind: "block",
                type: "turn",
              },
            ],
          },
          {
            kind: "category",
            name: "Looks",
            colour: "290",
            contents: [
              {
                kind: "block",
                type: "say",
              },
            ],
          },
          {
            kind: "category",
            name: "Control",
            colour: "180",
            contents: [
              {
                kind: "block",
                type: "controls_repeat_ext",
                inputs: {
                  TIMES: {
                    shadow: {
                      type: "math_number",
                      fields: {
                        NUM: 10,
                      },
                    },
                  },
                },
              },
              {
                kind: "block",
                type: "controls_if",
              },
              {
                kind: "block",
                type: "controls_whileUntil",
              },
            ],
          },
          {
            kind: "category",
            name: "Math",
            colour: "230",
            contents: [
              {
                kind: "block",
                type: "math_number",
              },
              {
                kind: "block",
                type: "math_arithmetic",
              },
            ],
          },
        ],
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: "#ccc",
        snap: true,
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
    });

    // Cleanup
    return () => {
      workspace.current?.dispose();
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Sprite Selector */}
      <div className="border-b bg-muted/30 px-4 py-2 flex items-center gap-3 z-10">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Target Sprite:</span>
        <Select
          value={selectedSpriteId || "all"}
          onValueChange={(value) => selectSprite(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px] h-8">
            <SelectValue placeholder="Select sprite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                All Sprites ({sprites.length})
              </span>
            </SelectItem>
            {sprites.map((sprite) => (
              <SelectItem key={sprite.id} value={sprite.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sprite.color || "#3b82f6" }}
                  />
                  {sprite.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {selectedSpriteId ? "Blocks run for selected sprite only" : "Blocks run for all sprites"}
        </span>
      </div>
      
      {/* Blockly Workspace */}
      <div 
        ref={blocklyDiv} 
        className="flex-1 w-full"
      />
    </div>
  );
})
