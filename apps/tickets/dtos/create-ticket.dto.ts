import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { TicketPriority } from "../enums/ticket-priority.enum";
import { TicketSeverity } from "../enums/ticket-severity.enum";
import { TicketType } from "../enums/ticket-type.enum";

export class CreateTicketDto {
    @ApiProperty()
    @IsString()
    issue: string;

    @ApiProperty({ enum: TicketPriority })
    @IsEnum(TicketPriority)
    priority: TicketPriority

    @ApiProperty({ enum: TicketSeverity })
    @IsEnum(TicketSeverity)
    severity: TicketSeverity

    @ApiProperty({ enum: TicketType })
    @IsEnum(TicketType)
    type: TicketType

    @ApiProperty()
    @IsString()
    createdBy: string;

    @ApiProperty()
    @IsString()
    assignedTo: string;
}