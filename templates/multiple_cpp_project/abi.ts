import * as gulp from "gulp";
import { Service, project, ContractUtil } from "@wasm/studio-utils";

gulp.task("abi", async () => {
  // hello.cpp is target contract file (contract file should place in the first of array), in the following is dependent files
  const data = await Service.compileAbi([project.getFile("src/hello.cpp"),project.getFile("src/i18n.cpp"),project.getFile("src/i18n.h")], "cpp", "abi");
  const outAbi = project.newFile("out/hello.abi", "abi", true);
  outAbi.setData(data);
  ContractUtil.addNewContractInfo(data, "");
});
