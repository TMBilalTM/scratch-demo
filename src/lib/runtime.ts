import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// Define code generators for custom blocks

// ===== EVENTS =====
javascriptGenerator.forBlock["when_flag_clicked"] = function (block: Blockly.Block) {
  const code = javascriptGenerator.statementToCode(block, "DO");
  return `(async function() {\n${code}})();\n`;
};

// ===== MOTION =====
javascriptGenerator.forBlock["move_forward"] = function (block: Blockly.Block) {
  const steps = block.getFieldValue("STEPS");
  return `await moveForward(${steps});\n`;
};

javascriptGenerator.forBlock["turn"] = function (block: Blockly.Block) {
  const direction = block.getFieldValue("DIRECTION");
  const degrees = block.getFieldValue("DEGREES");
  const angle = direction === "RIGHT" ? degrees : -degrees;
  return `await turn(${angle});\n`;
};

javascriptGenerator.forBlock["go_to_xy"] = function (block: Blockly.Block) {
  const x = block.getFieldValue("X");
  const y = block.getFieldValue("Y");
  return `await goTo(${x}, ${y});\n`;
};

javascriptGenerator.forBlock["glide_to_xy"] = function (block: Blockly.Block) {
  const x = block.getFieldValue("X");
  const y = block.getFieldValue("Y");
  const secs = block.getFieldValue("SECS");
  return `await glideTo(${x}, ${y}, ${secs});\n`;
};

javascriptGenerator.forBlock["point_in_direction"] = function (block: Blockly.Block) {
  const angle = block.getFieldValue("ANGLE");
  return `setRotation(${angle});\n`;
};

javascriptGenerator.forBlock["change_x"] = function (block: Blockly.Block) {
  const dx = block.getFieldValue("DX");
  return `changeX(${dx});\n`;
};

javascriptGenerator.forBlock["change_y"] = function (block: Blockly.Block) {
  const dy = block.getFieldValue("DY");
  return `changeY(${dy});\n`;
};

javascriptGenerator.forBlock["set_x"] = function (block: Blockly.Block) {
  const x = block.getFieldValue("X");
  return `setX(${x});\n`;
};

javascriptGenerator.forBlock["set_y"] = function (block: Blockly.Block) {
  const y = block.getFieldValue("Y");
  return `setY(${y});\n`;
};

// ===== LOOKS =====
javascriptGenerator.forBlock["say"] = function (block: Blockly.Block) {
  const text = block.getFieldValue("TEXT");
  return `say("${text}");\nawait wait(2000);\nsay("");\n`;
};

javascriptGenerator.forBlock["say_for_secs"] = function (block: Blockly.Block) {
  const text = block.getFieldValue("TEXT");
  const secs = block.getFieldValue("SECS");
  return `say("${text}");\nawait wait(${secs} * 1000);\nsay("");\n`;
};

javascriptGenerator.forBlock["show"] = function (block: Blockly.Block) {
  return `show();\n`;
};

javascriptGenerator.forBlock["hide"] = function (block: Blockly.Block) {
  return `hide();\n`;
};

javascriptGenerator.forBlock["change_size"] = function (block: Blockly.Block) {
  const change = block.getFieldValue("CHANGE");
  return `changeSize(${change});\n`;
};

javascriptGenerator.forBlock["set_size"] = function (block: Blockly.Block) {
  const size = block.getFieldValue("SIZE");
  return `setSize(${size});\n`;
};

// ===== CONTROL =====
javascriptGenerator.forBlock["wait_seconds"] = function (block: Blockly.Block) {
  const seconds = block.getFieldValue("SECONDS");
  return `await wait(${seconds} * 1000);\n`;
};

javascriptGenerator.forBlock["repeat_times"] = function (block: Blockly.Block) {
  const times = block.getFieldValue("TIMES");
  const branch = javascriptGenerator.statementToCode(block, "DO");
  return `for(let i = 0; i < ${times}; i++) {\n${branch}}\n`;
};

javascriptGenerator.forBlock["forever"] = function (block: Blockly.Block) {
  const branch = javascriptGenerator.statementToCode(block, "DO");
  return `while(true) {\n${branch}}\n`;
};

javascriptGenerator.forBlock["if_then"] = function (block: Blockly.Block) {
  const condition = javascriptGenerator.valueToCode(block, "CONDITION", 0) || "false";
  const branch = javascriptGenerator.statementToCode(block, "DO");
  return `if(${condition}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock["if_then_else"] = function (block: Blockly.Block) {
  const condition = javascriptGenerator.valueToCode(block, "CONDITION", 0) || "false";
  const branch1 = javascriptGenerator.statementToCode(block, "DO");
  const branch2 = javascriptGenerator.statementToCode(block, "ELSE");
  return `if(${condition}) {\n${branch1}} else {\n${branch2}}\n`;
};

// ===== OPERATORS =====
javascriptGenerator.forBlock["random_number"] = function (block: Blockly.Block) {
  const from = block.getFieldValue("FROM");
  const to = block.getFieldValue("TO");
  return [`Math.floor(Math.random() * (${to} - ${from} + 1)) + ${from}`, 0];
};

// ===== SENSING =====
javascriptGenerator.forBlock["mouse_x"] = function () {
  return ["mouseX()", 0];
};

javascriptGenerator.forBlock["mouse_y"] = function () {
  return ["mouseY()", 0];
};

javascriptGenerator.forBlock["key_pressed"] = function (block: Blockly.Block) {
  const key = block.getFieldValue("KEY");
  return [`keyPressed("${key}")`, 0];
};

javascriptGenerator.forBlock["touching_mouse"] = function () {
  return [`touching("mouse-pointer")`, 0];
};

javascriptGenerator.forBlock["distance_to_mouse"] = function () {
  return [`distanceTo(mouseX(), mouseY())`, 0];
};

javascriptGenerator.forBlock["timer_value"] = function () {
  return ["timer()", 0];
};

javascriptGenerator.forBlock["reset_timer"] = function () {
  return "resetTimer();\n";
};

export function generateCode(workspace: Blockly.WorkspaceSvg): string {
  return javascriptGenerator.workspaceToCode(workspace);
}

export interface SpriteCommands {
  moveForward: (steps: number) => Promise<void>;
  turn: (degrees: number) => Promise<void>;
  say: (text: string) => void;
  wait: (ms: number) => Promise<void>;
  goTo: (x: number, y: number) => Promise<void>;
  glideTo: (x: number, y: number, secs: number) => Promise<void>;
  setRotation: (degrees: number) => void;
  changeX: (delta: number) => void;
  changeY: (delta: number) => void;
  setX: (x: number) => void;
  setY: (y: number) => void;
  show: () => void;
  hide: () => void;
  changeSize: (delta: number) => void;
  setSize: (size: number) => void;
  pointTowards: (direction: 'up' | 'down' | 'left' | 'right') => void;
  
  // Sensing
  mouseX: () => number;
  mouseY: () => number;
  keyPressed: (key: string) => boolean;
  touching: (target: string) => boolean;
  distanceTo: (x: number, y: number) => number;
  timer: () => number;
  resetTimer: () => void;
}

interface SpriteState {
  x: number;
  y: number;
  rotation: number;
}

export function createRuntime(
  initialState: SpriteState,
  updateSprite: (updates: any) => void,
  onComplete: () => void,
  getStoreState?: () => any
): SpriteCommands {
  let currentX = initialState.x;
  let currentY = initialState.y;
  let currentRotation = initialState.rotation;

  // Canvas bounds (640x480)
  const BOUNDS = { minX: 30, maxX: 610, minY: 30, maxY: 450 };

  const clampToBounds = (x: number, y: number) => {
    return {
      x: Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, x)),
      y: Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, y)),
    };
  };

  const smoothMove = async (targetX: number, targetY: number, duration: number = 300) => {
    const startX = currentX;
    const startY = currentY;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out animation
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const clamped = clampToBounds(
          startX + (targetX - startX) * eased,
          startY + (targetY - startY) * eased
        );
        
        currentX = clamped.x;
        currentY = clamped.y;
        updateSprite({ x: currentX, y: currentY });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

  const smoothRotate = async (targetRotation: number, duration: number = 200) => {
    const startRotation = currentRotation;
    const startTime = Date.now();

    // Normalize to -180 to 180 range
    const normalizeAngle = (angle: number) => {
      angle = angle % 360;
      if (angle > 180) angle -= 360;
      if (angle < -180) angle += 360;
      return angle;
    };

    const diff = normalizeAngle(targetRotation - startRotation);

    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out animation
        const eased = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + diff * eased;
        updateSprite({ rotation: currentRotation });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentRotation = targetRotation;
          updateSprite({ rotation: currentRotation });
          resolve();
        }
      };
      animate();
    });
  };

  return {
    moveForward: async (steps: number) => {
      // 0° = sağ, 90° = aşağı, 180° = sol, 270° = yukarı
      const radians = (currentRotation * Math.PI) / 180;
      const targetX = currentX + steps * Math.cos(radians);
      const targetY = currentY + steps * Math.sin(radians);
      await smoothMove(targetX, targetY, Math.abs(steps) * 3);
    },

    turn: async (degrees: number) => {
      await smoothRotate(currentRotation + degrees);
    },

    say: (text: string) => {
      updateSprite({ message: text });
      setTimeout(() => {
        updateSprite({ message: undefined });
      }, 2000);
    },

    wait: (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    goTo: async (x: number, y: number) => {
      await smoothMove(x, y);
    },

    glideTo: async (x: number, y: number, secs: number) => {
      await smoothMove(x, y, secs * 1000);
    },

    setRotation: (degrees: number) => {
      currentRotation = degrees;
      updateSprite({ rotation: currentRotation });
    },

    changeX: (delta: number) => {
      const clamped = clampToBounds(currentX + delta, currentY);
      currentX = clamped.x;
      updateSprite({ x: currentX });
    },

    changeY: (delta: number) => {
      const clamped = clampToBounds(currentX, currentY + delta);
      currentY = clamped.y;
      updateSprite({ y: currentY });
    },

    setX: (x: number) => {
      const clamped = clampToBounds(x, currentY);
      currentX = clamped.x;
      updateSprite({ x: currentX });
    },

    setY: (y: number) => {
      const clamped = clampToBounds(currentX, y);
      currentY = clamped.y;
      updateSprite({ y: currentY });
    },

    show: () => {
      updateSprite({ visible: true });
    },

    hide: () => {
      updateSprite({ visible: false });
    },

    changeSize: (delta: number) => {
      updateSprite((current: any) => ({ size: Math.max(5, Math.min(300, (current.size || 100) + delta)) }));
    },

    setSize: (size: number) => {
      updateSprite({ size: Math.max(5, Math.min(300, size)) });
    },

    pointTowards: (direction: 'up' | 'down' | 'left' | 'right') => {
      const directions = { right: 0, down: 90, left: 180, up: 270 };
      currentRotation = directions[direction];
      updateSprite({ rotation: currentRotation });
    },
    
    // Sensing
    mouseX: () => {
      if (!getStoreState) return 0;
      return getStoreState().mouseX;
    },
    
    mouseY: () => {
      if (!getStoreState) return 0;
      return getStoreState().mouseY;
    },
    
    keyPressed: (key: string) => {
      if (!getStoreState) return false;
      const pressedKeys = getStoreState().pressedKeys;
      return pressedKeys.has(key.toLowerCase());
    },
    
    touching: (target: string) => {
      // Simplified collision detection
      if (!getStoreState) return false;
      if (target === 'mouse-pointer') {
        const state = getStoreState();
        const dx = currentX - state.mouseX;
        const dy = currentY - state.mouseY;
        return Math.sqrt(dx * dx + dy * dy) < 50;
      }
      return false;
    },
    
    distanceTo: (x: number, y: number) => {
      const dx = currentX - x;
      const dy = currentY - y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    
    timer: () => {
      if (!getStoreState) return 0;
      return getStoreState().getTimer();
    },
    
    resetTimer: () => {
      if (getStoreState) {
        getStoreState().resetTimer();
      }
    },
  };
}

export async function executeCode(
  code: string,
  runtime: SpriteCommands
): Promise<void> {
  try {
    // Create safe execution context with all commands
    const moveForward = runtime.moveForward;
    const turn = runtime.turn;
    const say = runtime.say;
    const wait = runtime.wait;
    const goTo = runtime.goTo;
    const glideTo = runtime.glideTo;
    const setRotation = runtime.setRotation;
    const changeX = runtime.changeX;
    const changeY = runtime.changeY;
    const setX = runtime.setX;
    const setY = runtime.setY;
    const show = runtime.show;
    const hide = runtime.hide;
    const changeSize = runtime.changeSize;
    const setSize = runtime.setSize;
    const pointTowards = runtime.pointTowards;
    
    // Sensing
    const mouseX = runtime.mouseX;
    const mouseY = runtime.mouseY;
    const keyPressed = runtime.keyPressed;
    const touching = runtime.touching;
    const distanceTo = runtime.distanceTo;
    const timer = runtime.timer;
    const resetTimer = runtime.resetTimer;

    // Execute code
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(
      "moveForward",
      "turn",
      "say",
      "wait",
      "goTo",
      "glideTo",
      "setRotation",
      "changeX",
      "changeY",
      "setX",
      "setY",
      "show",
      "hide",
      "changeSize",
      "setSize",
      "pointTowards",
      "mouseX",
      "mouseY",
      "keyPressed",
      "touching",
      "distanceTo",
      "timer",
      "resetTimer",
      code
    );
    await fn(
      moveForward,
      turn,
      say,
      wait,
      goTo,
      glideTo,
      setRotation,
      changeX,
      changeY,
      setX,
      setY,
      show,
      hide,
      changeSize,
      setSize,
      pointTowards,
      mouseX,
      mouseY,
      keyPressed,
      touching,
      distanceTo,
      timer,
      resetTimer
    );
      setSize,
      pointTowards
    );
  } catch (error) {
    console.error("Execution error:", error);
    throw error;
  }
}
