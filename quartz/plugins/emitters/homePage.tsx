import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { ProcessedContent, QuartzPluginData, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import path from "path"
import {
  FilePath,
  FullSlug,
  SimpleSlug,
  stripSlashes,
  joinSegments,
  pathToRoot,
  simplifySlug,
} from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { FolderContent } from "../../components"
import { write } from "./helpers"
import { i18n } from "../../i18n"
import DepGraph from "../../depgraph"

interface HomePageOptions extends FullPageLayout {
  sort?: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

/**
 * This is totally buggy, but it's a start. This just replaces the content of /blog and puts it at the root index.
 * @param userOpts 
 * @returns 
 */
export const HomePage: QuartzEmitterPlugin<Partial<HomePageOptions>> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: FolderContent({ sort: userOpts?.sort }),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "HomePage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async getDependencyGraph(_ctx, content, _resources) {
      // Example graph:
      // nested/file.md --> nested/index.html
      // nested/file2.md ------^
      const graph = new DepGraph<FilePath>()

      content.map(([_tree, vfile]) => {
        const slug = vfile.data.slug
        const folderName = path.dirname(slug ?? "") as SimpleSlug
        if (slug && (folderName !== "." && folderName !== "tags") || slug === "index") {
          graph.addEdge(vfile.data.filePath!, joinSegments(folderName, "index.html") as FilePath)
        }
      })

      return graph
    },
    async emit(ctx, content, resources): Promise<FilePath[]> {
      const fps: FilePath[] = []
      const allFiles = content.map((c) => c[1].data)
      const cfg = ctx.cfg.configuration
      const source = "blog" as FullSlug
    
      const folders: Set<SimpleSlug> = new Set();
      folders.add("." as SimpleSlug);

      const blogFolder: SimpleSlug =
        allFiles.flatMap((data) => {
          return data.slug
            ? _getFolders(data.slug).filter(
                (folderName) => {
                  return folderName === "blog"
                }
              )
            : []
        })[0];



      const folderDescriptions: Record<string, ProcessedContent> = Object.fromEntries(
        [blogFolder].map((folder) => [
          folder,
          defaultProcessedContent({
            slug: joinSegments(folder, "index") as FullSlug,
            frontmatter: {
              title: `${i18n(cfg.locale).pages.folderContent.folder}: ${folder}`,
              tags: [],
            },
          }),
        ]),
      )

      for (const [tree, file] of content) {
        const slug = stripSlashes(simplifySlug(file.data.slug!)) as SimpleSlug
        if (folders.has(slug)) {
          folderDescriptions[slug] = [tree, file]
        }
      }

      for (const folder of [blogFolder]) {
        const slug = joinSegments(folder, "index") as FullSlug
        const externalResources = pageResources(pathToRoot(slug), resources)
        const [tree, file] = folderDescriptions[folder]
        const componentData: QuartzComponentProps = {
          ctx,
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles,
        }

        const content = renderPage(cfg, source, componentData, opts, externalResources)
        const output = joinSegments(".", "index") as FullSlug
        const fp = await write({
          ctx,
          content,
          slug: output,
          ext: ".html",
        })

        fps.push(fp)
      }
      return fps
    },
  }
}

function _getFolders(slug: FullSlug): SimpleSlug[] {
  var folderName = path.dirname(slug ?? "") as SimpleSlug
  const parentFolderNames = [folderName]

  while (folderName !== ".") {
    folderName = path.dirname(folderName ?? "") as SimpleSlug
    parentFolderNames.push(folderName)
  }
  return parentFolderNames
}