import { ReactComponent as SpinnerSVG } from "../appImgs/spinner.svg";
import React from "react";

export default function Spinner({ size = "10em" }) {
  return (
    <SpinnerSVG id={"loadingSpinner"} style={{ height: size, width: size }} />
  );
}
