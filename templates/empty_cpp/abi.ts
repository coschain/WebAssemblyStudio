import * as gulp from "gulp";
import { Service, project } from "@wasm/studio-utils";

gulp.task("abi", async () => {
  const data = await Service.compileAbi(project.getFile("src/hello.cpp"), "cpp", "abi");
  const outAbi= project.newFile("out/hello.abi", "abi", true);
  outAbi.setData(data);
});

gulp.task("default", ["abi"], async () => {});
