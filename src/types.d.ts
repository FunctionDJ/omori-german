import { Global } from "../config/types"

export type BuildFunction = (filepath: string, global: Global) => Promise<string|Buffer>
export type CheckFunction = (filepath: string, global: Global) => Promise<void>|void

export interface ActionMapping {
  build: BuildFunction|null
  check: CheckFunction|null
  needExternalIndex?: boolean
}