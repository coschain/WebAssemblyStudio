
import * as React from "react";
import * as ReactDOM from "react-dom";
import "../../style/deployResultAlert.css";

export interface DeployResultAlertProps {
    type: number; // 0: deploy fail 1: deploy success
    err: string; //  the detail error info
    txHash: string; // the tx hash if deploy success
    handler: Function; // the call back
}

interface DeployResultAlertState {
    visible: boolean; // hide or show
}

export class DeployResultAlert extends React.Component<DeployResultAlertProps, DeployResultAlertState> {
    constructor(props: DeployResultAlertProps) {
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
        this.holder.setAttribute("id", "DeployResultAlert");
        document.body.appendChild(this.holder);
        const el = this.render();
        ReactDOM.render(
            el,
            this.holder
        );
    }

    private hide = () => {
        if (this.isAnimating) {
            return;
        }
        this.state = {
            visible: false,
        };
        // rerender to trigger hide animation
        ReactDOM.render(
            this.render(),
            this.holder
        );
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
            if (this.props.handler) {
                this.props.handler();
            }
            this.removeAlert();
        }
    }

    private onClickConfirm = () => {
        this.hide();
    }

    getTitle() {
        if (this.props.type === 0) {
            return "Deployment Failed";
        }
        return "Successful Deployment";
    }

    getElement = () => {
        const aniStyle = {
            animationDuration: .3 + "s",
            WebkitAnimationDuration: .3 + "s"
        };
        const title = this.getTitle();
        const err = this.props.err;
        let txHash = "";
        if (this.props.txHash) {
            txHash = this.props.txHash;
        }
        let desDiv = <div className={"deployResultAlert-desc"}>
            <span>Successful deployment contract, You can view it by transaction hash: <a className={"link_style"} href={"http://testexplorer.contentos.io/#/tx/" + txHash} target={"_blank"}>{txHash}</a>
                       </span>
                    </div>;

        if (this.props.type === 0) {
            desDiv = <div className={"deployResultAlert-desc"}>
                       <div>Contract deployment failed, Error is as follows:  {err}</div>
                     </div>;
        }

        const aniClassName = "deployResultAlert-bg" +  " " + "deployResultAlert-fade-" + (this.state.visible ? "enter" : "leave");
        return (
            <div style={aniStyle} className={aniClassName} onAnimationEnd={this.onAnimationEnd} onAnimationStart={this.onAnimationStart}>
                <div className={"deployResultAlert-card"}>
                    <div className={"deployResultAlert-headTitle"}>{title}</div>
                    <div className={"deployResultAlert-descBox"}>
                        {desDiv}
                    </div>
                    <div className={"deployResultAlert-btnItem"}>
                        <button className={"deployResultAlert-confirmBtn"} onClick={this.onClickConfirm}>Confirm</button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.getElement();
    }
}
