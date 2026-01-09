import { create } from "zustand";

interface Sprite {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
  visible: boolean;
  costume: string;
  costumeSvg?: string;
  message?: string;
  color?: string;
}

interface EditorStore {
  sprites: Sprite[];
  initialSprites: Sprite[]; // Başlangıç durumu
  selectedSpriteId: string | null;
  isPlaying: boolean;
  zoom: number;
  gridEnabled: boolean;
  backdrop: string;
  
  // Sensing state
  mouseX: number;
  mouseY: number;
  pressedKeys: Set<string>;
  timer: number;
  timerStartTime: number;
  
  addSprite: (sprite: Sprite) => void;
  updateSprite: (id: string, updates: Partial<Sprite>) => void;
  deleteSprite: (id: string) => void;
  selectSprite: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setBackdrop: (backdrop: string) => void;
  resetStage: () => void;
  resetToInitialState: () => void;
  saveInitialState: () => void;
  setSprites: (sprites: Sprite[]) => void;
  loadProjectState: (state: { sprites: Sprite[]; backdrop: string; zoom?: number; gridEnabled?: boolean }) => void;
  
  // Sensing actions
  setMousePosition: (x: number, y: number) => void;
  setKeyPressed: (key: string, pressed: boolean) => void;
  resetTimer: () => void;
  getTimer: () => number;
}

const defaultSprite: Sprite = {
  id: "sprite-1",
  name: "Cat",
  x: 240,
  y: 180,
  rotation: 0,
  size: 80,
  visible: true,
  costume: "cat",
  color: "#FF6B6B",
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  sprites: [defaultSprite],
  initialSprites: [defaultSprite], // Başlangıç durumunu da sakla
  selectedSpriteId: "sprite-1",
  isPlaying: false,
  zoom: 1,
  gridEnabled: true,
  backdrop: "sky",
  
  // Sensing state
  mouseX: 0,
  mouseY: 0,
  pressedKeys: new Set<string>(),
  timer: 0,
  timerStartTime: Date.now(),
  
  addSprite: (sprite) =>
    set((state) => {
      const newSprites = [...state.sprites, sprite];
      return {
        sprites: newSprites,
        initialSprites: JSON.parse(JSON.stringify(newSprites)), // Başlangıç durumunu da güncelle
        selectedSpriteId: sprite.id,
      };
    }),
    
  updateSprite: (id, updates) =>
    set((state) => ({
      sprites: state.sprites.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
    
  deleteSprite: (id) =>
    set((state) => {
      const newSprites = state.sprites.filter((s) => s.id !== id);
      return {
        sprites: newSprites,
        initialSprites: JSON.parse(JSON.stringify(newSprites)), // Başlangıç durumunu da güncelle
        selectedSpriteId:
          state.selectedSpriteId === id ? null : state.selectedSpriteId,
      };
    }),
    
  selectSprite: (id) => set({ selectedSpriteId: id }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
  
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  
  setBackdrop: (backdrop) => set({ backdrop }),
  
  resetStage: () =>
    set((state) => ({
      sprites: state.sprites.map((s) => ({
        ...s,
        x: 240,
        y: 180,
        rotation: 0,
        size: 80,
        message: undefined,
      })),
      isPlaying: false,
    })),
  
  // Runtime çalıştırıldığında başlangıç durumuna dön
  resetToInitialState: () =>
    set((state) => ({
      sprites: JSON.parse(JSON.stringify(state.initialSprites)), // Deep copy
      isPlaying: false,
    })),
  
  // Mevcut durumu başlangıç durumu olarak kaydet
  saveInitialState: () =>
    set((state) => ({
      initialSprites: JSON.parse(JSON.stringify(state.sprites)), // Deep copy
    })),
    
  setSprites: (sprites) => set({ sprites }),
  
  loadProjectState: (state) => 
    set(() => ({
      sprites: state.sprites,
      initialSprites: JSON.parse(JSON.stringify(state.sprites)), // Başlangıç durumunu da kaydet
      backdrop: state.backdrop,
      zoom: state.zoom ?? 1,
      gridEnabled: state.gridEnabled ?? true,
    })),
  
  // Sensing actions
  setMousePosition: (x, y) => set({ mouseX: x, mouseY: y }),
  
  setKeyPressed: (key, pressed) =>
    set((state) => {
      const newKeys = new Set(state.pressedKeys);
      if (pressed) {
        newKeys.add(key.toLowerCase());
      } else {
        newKeys.delete(key.toLowerCase());
      }
      return { pressedKeys: newKeys };
    }),
  
  resetTimer: () => set({ timerStartTime: Date.now(), timer: 0 }),
  
  getTimer: () => {
    const state = get();
    return (Date.now() - state.timerStartTime) / 1000;
  },
}));
