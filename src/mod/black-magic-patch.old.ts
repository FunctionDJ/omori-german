export const blackMagicPatch = <T extends { prototype: any }, U>({
  parent,
  parentFnName,
  cache,
  getOldChildBound,
  stickFn,
  transformArgs
}: {
  parent: T
  parentFnName: string
  cache?: (parent: T) => U
  getOldChildBound: (parent: T) => Function
  stickFn: (parent: T, newFn: Function) => void
  transformArgs: (args: any[], cache: U) => any[]
}) => {
  const oldParent: Function = parent.prototype[parentFnName]

  parent.prototype[parentFnName] = function () {
    if (cache !== undefined) {
      this._cached = cache(this)
    }

    if (this.patched) {
      return oldParent.call(this, ...arguments)
    }

    this.patched = true

    const oldChild = getOldChildBound(this)
    const oldThis = this

    stickFn(this, function (...args) {
      const { stack } = new Error()

      const regex = new RegExp(`${oldParent.name}\\.${parentFnName}`)

      if (!regex.test(stack)) {
        return oldChild(...args)
      }

      const newArgs = transformArgs(args, oldThis._cached)
      return oldChild(...newArgs)
    })
  }
}
