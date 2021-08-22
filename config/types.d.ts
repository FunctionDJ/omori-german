import { ValidateFunction } from "ajv"

export interface Config {
  userTags: string[]
  stateTags: string[]
  additionalTags: string[]
  requiredTags: string[]
  tagValues: string[]
  contributorsIndex: Record<string, string>
  bannedStringsInYaml: Record<string, string>
  bundleModsInKit: string[]
  extraFiles: string[]
}

export type Index = Record<string, {
  Status: string
  Credits: string[]
  ["Verified by"]: string[]
}>

export interface Global extends Config {
  validTags: string[],
  contributors: string[],
  indexValidator: ValidateFunction,
  getAjvErrorText(): string
  indexStore: Record<string, Index>
  filesNeedIndex: string[]
}