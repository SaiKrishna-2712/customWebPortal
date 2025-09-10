sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.inctue.customwebportal.controller.FAQ", {
        onInit: function () {
            // Sample FAQ data
            var oData = {
                faqs: [
                    { question: "What is DHO?" },
                    { question: "What does Virtual vs. Persistent Model mean?" },
                    { question: "How do I convert to Constant Currency or As Reported Currency?" },
                    { question: "What is changing relating to data with DHO optimization?" }
                ]
            };
            this.getView().setModel(new JSONModel(oData), "faqModel");

            // Attach draggable after rendering
            this.getView().addEventDelegate({
                onAfterRendering: () => {
                    const oBtn = this.byId("faqBtnUI5");
                    if (oBtn) {
                        this._makeDraggable(oBtn.getDomRef());
                    }
                }
            });
        },

        onOpenFAQ: function () {
            if (!this._oPopover) {
                this._oPopover = this.byId("faqPopover");
            }
            this._oPopover.openBy(this.byId("faqBtnUI5"));
        },

        _makeDraggable: function (el) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            el.onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                el.style.top = (el.offsetTop - pos2) + "px";
                el.style.left = (el.offsetLeft - pos1) + "px";
                el.style.bottom = "auto"; // prevent snapping back
                el.style.right = "auto";
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    });
});
