import * as gulp from "gulp";
import { Service, project } from "@wasm/studio-utils";

gulp.task("abi", async () => {
  // hello.cpp is target contract file (contract file should place in the first of array), in the following is dependent files
  const data = await Service.compileAbi([project.getFile("src/hello.cpp"),project.getFile("src/header.hpp")], "cpp", "abi");
  const outAbi= project.newFile("out/hello.abi", "abi", true);
  outAbi.setData(data);
});

gulp.task("default", ["abi"], async () => {});
