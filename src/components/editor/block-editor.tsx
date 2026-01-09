"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { generateCode } from "@/lib/runtime";
import { useEditorStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

interface BlockEditorProps {
  initialXml?: string;
}

export interface BlockEditorHandle {
  getCode: () => string;
  getWorkspace: () => Blockly.WorkspaceSvg | null;
  getWorkspaceXml: () => string;
  loadWorkspaceXml: (xml: string) => void;
}

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(({ initialXml }, ref) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const { sprites, selectedSpriteId, selectSprite } = useEditorStore();

  useImperativeHandle(ref, () => ({
    getCode: () => {
      if (!workspace.current) return "";
      return generateCode(workspace.current);
    },
    getWorkspace: () => workspace.current,
    getWorkspaceXml: () => {
      if (!workspace.current) return "";
      const xml = Blockly.Xml.workspaceToDom(workspace.current);
      return Blockly.Xml.domToText(xml);
    },
    loadWorkspaceXml: (xml: string) => {
      if (!workspace.current) return;
      try {
        workspace.current.clear();
        if (!xml) return;
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

    // MOTION BLOCKS
    Blockly.Blocks["go_to_xy"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("go to x:")
          .appendField(new Blockly.FieldNumber(0, -240, 240), "X")
          .appendField("y:")
          .appendField(new Blockly.FieldNumber(0, -180, 180), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Go to position instantly");
      },
    };

    Blockly.Blocks["point_in_direction"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("point in direction")
          .appendField(new Blockly.FieldNumber(90, 0, 360), "DIRECTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Point sprite in direction (0=right, 90=down, 180=left, 270=up)");
      },
    };

    Blockly.Blocks["glide_to_xy"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("glide")
          .appendField(new Blockly.FieldNumber(1, 0.1, 10), "SECS")
          .appendField("secs to x:")
          .appendField(new Blockly.FieldNumber(0, -240, 240), "X")
          .appendField("y:")
          .appendField(new Blockly.FieldNumber(0, -180, 180), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Glide to position in seconds");
      },
    };

    Blockly.Blocks["change_x"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("change x by")
          .appendField(new Blockly.FieldNumber(10), "DX");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Change x position");
      },
    };

    Blockly.Blocks["change_y"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("change y by")
          .appendField(new Blockly.FieldNumber(10), "DY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Change y position");
      },
    };

    Blockly.Blocks["set_x"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("set x to")
          .appendField(new Blockly.FieldNumber(0, -240, 240), "X");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Set x position");
      },
    };

    Blockly.Blocks["set_y"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("set y to")
          .appendField(new Blockly.FieldNumber(0, -180, 180), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Set y position");
      },
    };

    // LOOKS BLOCKS
    Blockly.Blocks["say_for_secs"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("say")
          .appendField(new Blockly.FieldTextInput("Hello!"), "TEXT")
          .appendField("for")
          .appendField(new Blockly.FieldNumber(2, 0.1, 10), "SECS")
          .appendField("secs");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Say text for seconds");
      },
    };

    Blockly.Blocks["show"] = {
      init: function () {
        this.appendDummyInput().appendField("show");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Show sprite");
      },
    };

    Blockly.Blocks["hide"] = {
      init: function () {
        this.appendDummyInput().appendField("hide");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Hide sprite");
      },
    };

    Blockly.Blocks["change_size"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("change size by")
          .appendField(new Blockly.FieldNumber(10, -100, 100), "DELTA");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Change sprite size");
      },
    };

    Blockly.Blocks["set_size"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("set size to")
          .appendField(new Blockly.FieldNumber(100, 5, 300), "SIZE")
          .appendField("%");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip("Set sprite size");
      },
    };

    // CONTROL BLOCKS
    Blockly.Blocks["wait_seconds"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("wait")
          .appendField(new Blockly.FieldNumber(1, 0.1, 10), "SECONDS")
          .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Wait for seconds");
      },
    };

    Blockly.Blocks["repeat_times"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("repeat")
          .appendField(new Blockly.FieldNumber(10, 1, 999), "TIMES");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Repeat blocks N times");
      },
    };

    Blockly.Blocks["forever"] = {
      init: function () {
        this.appendDummyInput().appendField("forever");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setColour(330);
        this.setTooltip("Repeat blocks forever");
      },
    };

    Blockly.Blocks["if_then"] = {
      init: function () {
        this.appendValueInput("CONDITION")
          .setCheck("Boolean")
          .appendField("if");
        this.appendStatementInput("DO").setCheck(null).appendField("then");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("If condition then do");
      },
    };

    Blockly.Blocks["if_then_else"] = {
      init: function () {
        this.appendValueInput("CONDITION")
          .setCheck("Boolean")
          .appendField("if");
        this.appendStatementInput("DO").setCheck(null).appendField("then");
        this.appendStatementInput("ELSE").setCheck(null).appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("If condition then do else");
      },
    };

    // OPERATORS BLOCKS
    Blockly.Blocks["random_number"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("pick random")
          .appendField(new Blockly.FieldNumber(1), "FROM")
          .appendField("to")
          .appendField(new Blockly.FieldNumber(10), "TO");
        this.setOutput(true, "Number");
        this.setColour(60);
        this.setTooltip("Random number between two values");
      },
    };

    // SENSING BLOCKS
    Blockly.Blocks["mouse_x"] = {
      init: function () {
        this.appendDummyInput().appendField("mouse x");
        this.setOutput(true, "Number");
        this.setColour(180);
        this.setTooltip("Current mouse X position");
      },
    };

    Blockly.Blocks["mouse_y"] = {
      init: function () {
        this.appendDummyInput().appendField("mouse y");
        this.setOutput(true, "Number");
        this.setColour(180);
        this.setTooltip("Current mouse Y position");
      },
    };

    Blockly.Blocks["key_pressed"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("key")
          .appendField(
            new Blockly.FieldDropdown([
              ["space", " "],
              ["up arrow", "ArrowUp"],
              ["down arrow", "ArrowDown"],
              ["left arrow", "ArrowLeft"],
              ["right arrow", "ArrowRight"],
              ["a", "a"],
              ["b", "b"],
              ["c", "c"],
              ["d", "d"],
              ["w", "w"],
              ["s", "s"],
            ]),
            "KEY"
          )
          .appendField("pressed?");
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("Check if key is pressed");
      },
    };

    Blockly.Blocks["touching_mouse"] = {
      init: function () {
        this.appendDummyInput().appendField("touching mouse-pointer?");
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("Check if touching mouse");
      },
    };

    Blockly.Blocks["distance_to_mouse"] = {
      init: function () {
        this.appendDummyInput().appendField("distance to mouse");
        this.setOutput(true, "Number");
        this.setColour(180);
        this.setTooltip("Distance to mouse pointer");
      },
    };

    Blockly.Blocks["timer_value"] = {
      init: function () {
        this.appendDummyInput().appendField("timer");
        this.setOutput(true, "Number");
        this.setColour(180);
        this.setTooltip("Seconds since timer reset");
      },
    };

    Blockly.Blocks["reset_timer"] = {
      init: function () {
        this.appendDummyInput().appendField("reset timer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Reset timer to 0");
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
              {
                kind: "block",
                type: "go_to_xy",
              },
              {
                kind: "block",
                type: "glide_to_xy",
              },
              {
                kind: "block",
                type: "point_in_direction",
              },
              {
                kind: "block",
                type: "change_x",
              },
              {
                kind: "block",
                type: "change_y",
              },
              {
                kind: "block",
                type: "set_x",
              },
              {
                kind: "block",
                type: "set_y",
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
              {
                kind: "block",
                type: "say_for_secs",
              },
              {
                kind: "block",
                type: "show",
              },
              {
                kind: "block",
                type: "hide",
              },
              {
                kind: "block",
                type: "change_size",
              },
              {
                kind: "block",
                type: "set_size",
              },
            ],
          },
          {
            kind: "category",
            name: "Control",
            colour: "330",
            contents: [
              {
                kind: "block",
                type: "wait_seconds",
              },
              {
                kind: "block",
                type: "repeat_times",
              },
              {
                kind: "block",
                type: "forever",
              },
              {
                kind: "block",
                type: "if_then",
              },
              {
                kind: "block",
                type: "if_then_else",
              },
            ],
          },
          {
            kind: "category",
            name: "Operators",
            colour: "60",
            contents: [
              {
                kind: "block",
                type: "random_number",
              },
            ],
          },
          {
            kind: "category",
            name: "Sensing",
            colour: "180",
            contents: [
              {
                kind: "block",
                type: "mouse_x",
              },
              {
                kind: "block",
                type: "mouse_y",
              },
              {
                kind: "block",
                type: "key_pressed",
              },
              {
                kind: "block",
                type: "touching_mouse",
              },
              {
                kind: "block",
                type: "distance_to_mouse",
              },
              {
                kind: "block",
                type: "timer_value",
              },
              {
                kind: "block",
                type: "reset_timer",
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

    if (initialXml) {
      try {
        const dom = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(dom, workspace.current);
      } catch (error) {
        console.error("Failed to load initial blocks:", error);
      }
    }

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
