import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// Define code generators for custom blocks
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

javascriptGenerator.forBlock["say"] = function (block: Blockly.Block) {
  const text = block.getFieldValue("TEXT");
  return `say("${text}");\nawait wait(2000);\nsay("");\n`;
};

javascriptGenerator.forBlock["go_to_xy"] = function (block: Blockly.Block) {
  const x = block.getFieldValue("X");
  const y = block.getFieldValue("Y");
  return `await goTo(${x}, ${y});\n`;
};

javascriptGenerator.forBlock["point_in_direction"] = function (block: Blockly.Block) {
  const direction = block.getFieldValue("DIRECTION");
  return `pointTowards('${direction}');\n`;
};

javascriptGenerator.forBlock["when_flag_clicked"] = function (block: Blockly.Block) {
  const code = javascriptGenerator.statementToCode(block, "DO");
  return `(async function() {\n${code}})();\n`;
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
  setRotation: (degrees: number) => void;
  changeX: (delta: number) => void;
  changeY: (delta: number) => void;
  pointTowards: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

interface SpriteState {
  x: number;
  y: number;
  rotation: number;
}

export function createRuntime(
  initialState: SpriteState,
  updateSprite: (updates: any) => void,
  onComplete: () => void
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

    pointTowards: (direction: 'up' | 'down' | 'left' | 'right') => {
      const directions = { right: 0, down: 90, left: 180, up: 270 };
      currentRotation = directions[direction];
      updateSprite({ rotation: currentRotation });
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
    const setRotation = runtime.setRotation;
    const changeX = runtime.changeX;
    const changeY = runtime.changeY;
    const pointTowards = runtime.pointTowards;

    // Execute code
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction(
      "moveForward",
      "turn",
      "say",
      "wait",
      "goTo",
      "setRotation",
      "changeX",
      "changeY",
      "pointTowards",
      code
    );
    await fn(moveForward, turn, say, wait, goTo, setRotation, changeX, changeY, pointTowards);
  } catch (error) {
    console.error("Execution error:", error);
    throw error;
  }
}
