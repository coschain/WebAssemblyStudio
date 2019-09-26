import * as React from "react";
import * as ReactDOM from "react-dom";
import "../../style/contractInfoDialog.css";
import radio from "react-icons/md/radio";
import {int2bytes} from "cos-grpc-js/src/lib/crypto/util";
import {number} from "prop-types";

export interface ContractInfoDialogProps {
    contractName: string;
    userPrivateKey: string;
    accountName: string;
    confirmHandler: Function;
    cancelHandler: Function;
}

interface ContractInfoDialogState {
    visible: boolean;
}


class ContractInfoView extends React.Component<ContractInfoDialogProps, ContractInfoDialogState> {
    constructor(props: ContractInfoDialogProps) {
        super(props);
        this.state = {
            visible: true,
        };
    }

    private isDeployToMainNet = true;

    private elTagType = {
        contractName: "contName",
        accountName: "acctName",
        priKey: "prikey",
        desc: "desc",
        sourceCodeLocation: "surCodeLocation",
        deployChoice: "deploySelect"
    };

    private onClickClose = () =>  {
        this.setState({visible: false});
        if (this.props.cancelHandler) {
            this.props.cancelHandler();
        }
    }

    private chainType = {
        MainNet: 1,
        TestNet: 2
    }

    private onClickConfirm = () => {
        const nameInput = document.getElementById(this.elTagType.contractName) as HTMLInputElement;
        const name = nameInput.value;
        const priKeyInput = document.getElementById(this.elTagType.priKey) as HTMLInputElement;
        const key = priKeyInput.value;
        const acctInput = document.getElementById(this.elTagType.accountName) as HTMLInputElement;
        const acctName = acctInput.value;
        const descInput = document.getElementById(this.elTagType.desc) as HTMLInputElement;
        const desc = descInput.value;
        const sourceCodeInput = document.getElementById(this.elTagType.sourceCodeLocation) as HTMLInputElement;
        const sourceCodeLocation = sourceCodeInput.value;
        if (name.length > 0 && key.length > 0 && acctName.length > 0) {
            this.setState({visible: false});
            if (this.props.confirmHandler) {
                this.props.confirmHandler(name, key, acctName, desc, sourceCodeLocation, this.isDeployToMainNet);
            }
        }
    }

    private onChangeDeployChoice = (event: any) => {
        const selctVal = event.target.value;
        if (selctVal === this.chainType.MainNet) {
            this.isDeployToMainNet = true;
        } else {
            this.isDeployToMainNet = false;
        }
    }

    show  = () => {
        this.setState({visible: true});
    }

    render() {
        const aniStyle = {
            animationDuration: 6 + "s",
            WebkitAnimationDuration: .6 + "s"
        };

        const isShow = this.state.visible;
        const aniClassName = "contractInfoDialog-bg" +  " " + "contractInfoDialog-fade-" + (isShow ? "enter" : "leave");
        return (
        <div style={aniStyle} className={aniClassName}>
              <div className="contractInfoDialog-card">
                  <div className="contractInfoDialog-headTitle">Edit contract name and private key</div>
                  {/* contract name parts */}
                  <div className="contractInfoDialog-nameTitle">Contract Name:</div>
                  <div className="contractInfoDialog-input-container">
                      <input id={this.elTagType.contractName} className="contractInfoDialog-Input" type="text" autoComplete="off" defaultValue={this.props.contractName}/>
                  </div>

                  {/*account name*/}
                  <div className="contractInfoDialog-priKeyAndAcctTitle">Account Name:</div>
                  <div className="contractInfoDialog-input-container">
                      <input id={this.elTagType.accountName} className="contractInfoDialog-Input" type="text" autoComplete="off" defaultValue={this.props.accountName}/>
                  </div>

                  {/* private key parts */}
                  <div className="contractInfoDialog-priKeyAndAcctTitle">Private Key:</div>
                  <div className="contractInfoDialog-input-container">
                      <input id={this.elTagType.priKey} className="contractInfoDialog-Input" type="text" autoComplete="off" defaultValue={this.props.userPrivateKey}/>
                  </div>

                  {/*Description*/}
                  <div className="contractInfoDialog-priKeyAndAcctTitle">Description:</div>
                  <div className="contractInfoDialog-input-container">
                      <input id={this.elTagType.desc} className="contractInfoDialog-Input" type="text" autoComplete="off" />
                  </div>

                  {/*source code location*/}
                  <div className="contractInfoDialog-priKeyAndAcctTitle">Source code location:</div>
                  <div className="contractInfoDialog-input-container">
                      <input id={this.elTagType.sourceCodeLocation} className="contractInfoDialog-Input" type="text" autoComplete="off" />
                  </div>

                  <div className="contractInfoDialog-deploy-select-bg">
                      <div className="contractInfoDialog-priKeyAndAcctTitle">Select Chain</div>
                      <select className="contractInfoDialog-select"  id={this.elTagType.deployChoice} onChange={this.onChangeDeployChoice} >
                          <option value={this.chainType.MainNet}>Deploy to Main Net</option>
                          <option value={this.chainType.TestNet}>Deploy to Test Net</option>
                      </select>
                  </div>

                  {/* buttons */}
                  <div className="contractInfoDialog-btnItem">
                      <button className="contractInfoDialog-btn contractInfoDialog-confirmBtn"  onClick={this.onClickConfirm} > Confirm </button>
                      <button className="contractInfoDialog-btn contractInfoDialog-cancelBtn" v-if="btnType === 2" onClick={this.onClickClose}>Cancel</button>
                  </div>
              </div>
            </div>
     );
    }
}

export class ContractInfoDialog {
    private readonly props: ContractInfoDialogProps;
    private holder = document.createElement("div");
    constructor(props: ContractInfoDialogProps) {
        this.props = props;
    }

    private closeHandler = () => {
        if (this.props.cancelHandler)  {
            this.props.cancelHandler();
        }
        this.closeDialog();
    }

    private confirmHandler = (name: string, priKey: string, account: string, desc: string, sourceCodeLocation: string, isToMainNet: boolean) => {
        if (this.props.confirmHandler) {
            this.props.confirmHandler(name, priKey, account, desc, sourceCodeLocation, isToMainNet);
        }
        this.closeDialog();
    }

    showDialog() {
        // ***** must setAttribute  otherwise render fail*****
        this.holder.setAttribute("id", "contractInfoDialog");
        document.body.appendChild(this.holder);
        ReactDOM.render(
            <ContractInfoView contractName={this.props.contractName} userPrivateKey={this.props.userPrivateKey} accountName={this.props.accountName} confirmHandler={this.confirmHandler} cancelHandler={this.closeHandler}/>,
            this.holder
        );
    }

    closeDialog() {
        if (this.holder.parentNode)  {
            this.holder.parentNode.removeChild(this.holder);
        }
    }
}
