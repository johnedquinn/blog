import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "../styles/custom.scss"
import { GlobalConfiguration } from "../cfg"

// USER_DEFINED WHOLE FILE

export default (() => {
  const HorizontalRule: QuartzComponent = ({
    fileData,
    cfg,
  }: QuartzComponentProps) => {
    return (
        <hr style="margin:0px; padding:0px;"></hr>
    )
  }

  // HorizontalRule.css = styles
  return HorizontalRule
}) satisfies QuartzComponentConstructor
