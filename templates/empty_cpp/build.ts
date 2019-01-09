import * as gulp from "gulp";
import { Service, project } from "@wasm/studio-utils";

gulp.task("build", async () => {
  const data = await Service.compileFile([project.getFile("src/hello.cpp"),project.getFile("src/header.hpp")], "cpp", "wasm", "-g -O3");
  const outWasm = project.newFile("out/hello.wasm", "wasm", true);
  outWasm.setData(data);
});

gulp.task("default", ["build"], async () => {});
