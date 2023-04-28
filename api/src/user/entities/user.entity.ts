import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryColumn({ type: "varchar" })
    public id: string;

    @Column({ nullable: false })
    public name: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

}