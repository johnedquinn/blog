import { PageLayout, SharedLayout, FullPageLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileNode } from "./quartz/components/ExplorerNode"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Column(
      [Component.Search()]
    )
  ],
  afterBody: [
    Component.SubscribeForm(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/johnedquinn",
      LinkedIn: "https://www.linkedin.com/in/johnedquinn/",
      Instagram: "https://www.instagram.com/johnedquinn/",
    },
  }),
}

/**
 * USER-DEFINED!
 * @returns a function that sorts files by date and then alphabetically
 */
export function byDateAndAlphabetical(): (a: FileNode, b: FileNode) => number {
  return (a, b) => {

    // Sort order: folders first, then files. Sort folders and files alphabetically
    if ((!a.file && !b.file) || (a.file && b.file)) {
      // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
      // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
      var aDate = a.file?.dates?.created
      var bDate = b.file?.dates?.created
      if (aDate == undefined || bDate == undefined) {
        return a.displayName.localeCompare(b.displayName, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      }
      if (aDate > bDate) {
        return 1
      } else {
        return 1
      }
    }

    if (a.file && !b.file) {
      return 1
    } else {
      return -1
    }
  }
}

const spacer = Component.MobileOnly(Component.Spacer())
const home = Component.SideBarLink({ title: "Back to Main Site", path: "https://www.johnedq.com" })
const allPosts = Component.SideBarLink({ title: "All Posts", path: "/blog" as SimpleSlug })
const tags = Component.SideBarLink({ title: "Tags", path: "/tags" as SimpleSlug })
var column = Component.Column(
  [
    Component.PageTitle(),
    spacer,
    home,
    Component.HorizontalRule(),
    allPosts,
    tags,
  ]
)

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    column,
  ],
  right: [
    Component.Graph({
      localGraph: {
        depth: 3,
        fontSize: 0.65
      },
      globalGraph: {}
    }),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta()
  ],
  left: [
    column,
  ],
  right: [],
}
