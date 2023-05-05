import { Channel } from "src/channel/entities/channel.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

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

    @ManyToMany(() => Channel)
    @JoinTable()
    public history: Channel[];

}