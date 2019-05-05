import * as gulp from "gulp";
import { Service, project, ContractUtil } from "@wasm/studio-utils";

gulp.task("abi", async () => {
  // hello.cpp is target contract file (contract file should place in the first of array), in the following is dependent files
  const data = await Service.compileAbi([project.getFile("src/token.cpp")], "cpp", "abi");
  const outAbi = project.newFile("out/token.abi", "abi", true);
  outAbi.setData(data);
  ContractUtil.addNewContractInfo(data, "");
});
