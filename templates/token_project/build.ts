import * as gulp from "gulp";
import { Service, project, ContractUtil } from "@wasm/studio-utils";

// hello.cpp is target contract file (contract file should place in the first of array), in the following is dependent files
gulp.task("build", async () => {
  const data = await Service.compileFile([project.getFile("src/token.cpp")], "cpp", "wasm", "-g -O3");
  const outWasm = project.newFile("out/token.wasm", "wasm", true);
  outWasm.setData(data);
  ContractUtil.addNewContractInfo("", data);
});
