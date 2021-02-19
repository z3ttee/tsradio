export class Role {
    public readonly uuid: string
    public readonly name: string
    public readonly permissions: Array<String>
    public readonly hierarchy: Number

    constructor(uuid: string, name: string, permissions: Array<String>, hierarchy: Number) {
        this.uuid = uuid
        this.name = name
        this.permissions = permissions
        this.hierarchy = hierarchy
    }
}