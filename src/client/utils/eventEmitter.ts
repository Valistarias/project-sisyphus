export default class CustomEventEmitter<EvtRes> {
  evtTarget: DocumentFragment;
  addEventListener: (id: string, cb: (res: CustomEventInit<EvtRes>) => void) => void;
  removeEventListener: (id: string, cb: (res: CustomEventInit<EvtRes>) => void) => void;
  dispatchEvent: (id: string, data: EvtRes) => void;

  constructor() {
    this.evtTarget = document.createDocumentFragment();

    this.addEventListener = (id, cb) => {
      this.evtTarget.addEventListener(id, cb);
    };

    this.removeEventListener = (id, cb) => {
      this.evtTarget.removeEventListener(id, cb);
    };

    this.dispatchEvent = (id, data: EvtRes) => {
      const newEvt = new CustomEvent(id, { detail: data });
      this.evtTarget.dispatchEvent(newEvt);
    };
  }
};
