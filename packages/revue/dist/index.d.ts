type RevueCompoent<T = Record<string, any>> = (props: T) => RevueElement;
interface State {
    value: any;
    next: State | null;
}
interface HookState {
    currentHook: Hook | null;
    firstHook: Hook | null;
}
interface Hook {
    initValue: any;
    value: any;
    next: Hook | null;
}
interface UpdateQueue {
    update: Update | null;
    lastUpdate: Update | null;
}
interface Update<A = any> {
    action: A;
    next: Update | null;
}
export declare class StateImpl implements State {
    value: any;
    next: State | null;
    constructor(value: any, next?: State | null);
}
export interface RevueElement {
    rawType: Symbol;
    el: Element | null;
    state: HookState;
    updateQueue: UpdateQueue;
    childElement: RevueElement | null;
    type: string | RevueCompoent;
    update: any;
    isMounted: boolean;
    props: Record<string, any>;
    children: (RevueElement | any)[];
}
declare class RevueElementImpl implements RevueElement {
    type: RevueElement["type"];
    props: RevueElement["props"];
    children: RevueElement["children"];
    rawType: Symbol;
    el: null;
    updateQueue: {
        update: null;
        lastUpdate: null;
    };
    state: {
        currentHook: null;
        firstHook: null;
    };
    childElement: null;
    update: null;
    isMounted: boolean;
    constructor(type: RevueElement["type"], props: RevueElement["props"], children: RevueElement["children"]);
}
export declare function createElement(type: RevueElement["type"], props: RevueElement["props"], ...children: RevueElement["children"]): RevueElementImpl;
export declare function getUpdate(): any;
export declare function createRoot(element: RevueElement): {
    mount: (container: Element) => void;
};
export declare function useState<V = any>(defalutValue: V): any[];
export {};
