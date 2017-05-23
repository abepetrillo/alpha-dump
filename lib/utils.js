import fs from "fs";
import path from "path";

const pad2 = (n) => {
  return (n < 10 ? "0" : "") + n;
};

export const timeStamp = () => {
  const d = new Date();

  return d.getFullYear() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    pad2(d.getHours()) +
    pad2(d.getMinutes()) +
    pad2(d.getSeconds());
};

export const checkEnv = () => {
  let flag = true;
  let definedKeys = [];

  const exampleEnvFilePath = path.resolve(".example-env");

  if (!fs.existsSync(exampleEnvFilePath)) {
    throw new Error("Missing .example-env")
  }

  try {
    definedKeys = fs.readFileSync(exampleEnvFilePath, "utf8")
      .split("\n")
      .map(line => line.split("=")[0].split("export ")[1])
      .filter(variable => !!variable);

    definedKeys.forEach(defKey => {
      flag = flag && Object.keys(process.env).includes(defKey);
    });
  } catch (err) {
    throw new Error("Error parsing .example-env")
  }

  return flag;
};
