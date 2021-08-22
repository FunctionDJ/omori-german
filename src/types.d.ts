import { Global } from "../config/types"

export type BuildFunction = (filepath: string, global: Global) => Promise<string|Buffer>
export type CheckFunction = (filepath: string, global: Global) => Promise<void>|void

export interface ActionMapping {
  build: BuildFunction|null
  check: CheckFunction|null
  needExternalIndex?: boolean
}

export interface Mod {
  id: string
  name: string
  description: string
  version: string
  files: {
    text?: string[]
    plugins?: string[]
    assets?: string[]
    data?: string[]
  }
}
