import * as React from "react";
import * as ReactDOM from "react-dom";
import "../../style/switchNodeAlert.css";

const addrInputTag = "nodeAddrInput";

export interface SwitchNodeAlertProps {
    curNodeAddr: string; // current node address
    confirmHandler: Function; // the confirm call back
    cancelHandler: Function; // the cancel call back
}

interface SwitchNodeAlertStatus {
    visible: boolean; // control alert hide or show
}

export class SwitchNodeAlert extends React.Component<SwitchNodeAlertProps, SwitchNodeAlertStatus> {
    constructor(props: SwitchNodeAlertProps) {
        super(props);
        this.state = {
            visible: true,
        };
    }

    private holder = document.createElement("div");
    private isAnimating = false;

    showAlert = () => {
        if (this.isAnimating) {
            return;
        }
        this.holder.setAttribute("id", "switchNodeAlert");
        document.body.appendChild(this.holder);
        const el = this.render();
        ReactDOM.render(
            el,
            this.holder
        );
    }

    hide = () => {
        if (this.isAnimating) {
            return;
        }
        this.state = {
            visible: false
        }
        const el = this.render();
        ReactDOM.render(
            el,
            this.holder
        );
    }

    private  onClickConfirm = () => {
        if (this.isAnimating) {
            return;
        }
        if (this.props.confirmHandler) {
            const addrInput = document.getElementById(addrInputTag) as HTMLInputElement;
            const addr = addrInput.value;
            this.props.confirmHandler(addr);
        }
        this.hide();
    }

    private onClickCancel = () => {
        if (this.isAnimating) {
            return;
        }
        if (this.props.cancelHandler) {
            this.props.cancelHandler();
        }
        this.hide();
    }

    removeAlert() {
        if (this.holder.parentNode) {
            this.holder.parentNode.removeChild(this.holder);
        }
    }

    onAnimationStart = () => {
        this.isAnimating = true;
    }

    onAnimationEnd = () => {
        this.isAnimating = false;
        if (!this.state.visible) {
            this.removeAlert();
        }
    }

    getRenderElement = () => {
        const aniStyle = {
            animationDuration: .3 + "s",
            WebkitAnimationDuration: .3 + "s"
        };
        const curAddress = this.props.curNodeAddr;
        const aniClassName = "switchNodeAlert-bg" +  " " + "switchNodeAlert-fade-" + (this.state.visible ? "enter" : "leave");
        return (
            <div style={aniStyle} className={aniClassName} onAnimationStart={this.onAnimationStart} onAnimationEnd={this.onAnimationEnd}>
                <div className={"switchNodeAlert-card"}>
                    <div className={"switchNodeAlert-headTitle"}>Switch Node Address</div>
                    <div className={"switchNodeAlert-input-container"}>
                        <input type="text" className={"switchNodeAlert-Input"} defaultValue={curAddress} id={addrInputTag} autoComplete="off"/>
                    </div>
                    <div className={"switchNodeAlert-btnItem"}>
                        <button className={"switchNodeAlert-btn switchNodeAlert-confirmBtn"} onClick={this.onClickConfirm}>Confirm</button>
                        <button className={"switchNodeAlert-btn switchNodeAlert-cancelBtn"} onClick={this.onClickCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.getRenderElement();
    }

}
