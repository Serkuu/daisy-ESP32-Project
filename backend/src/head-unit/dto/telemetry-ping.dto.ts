import { IsInt, IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class TelemetryPingDto {
    @IsString()
    @IsOptional()
    apiKey?: string;

    @IsString()
    @IsNotEmpty()
    macAddress: string;

    @IsNumber()
    @IsNotEmpty()
    tempLevel: number;

    @IsInt()
    @IsNotEmpty()
    moistLevel: number;

    @IsInt()
    @IsOptional()
    batteryLevel?: number;
}
