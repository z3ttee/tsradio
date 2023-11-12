import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Artist {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column({ length: 120, unique: true, collation: "utf8mb4_general_ci", nullable: true })
    public name: string;
}
