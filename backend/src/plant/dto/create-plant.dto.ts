import { IsNotEmpty, IsString, IsInt, IsOptional } from "class-validator";

export class CreatePlantDto {
    @IsNotEmpty()
    @IsString()
    plantName: string;

    @IsNotEmpty()
    @IsInt()
    optimalMoistureLevel: number;

    @IsOptional()
    @IsInt()
    gardenId: number;

    @IsOptional()
    @IsString()
    plantSpecies: string;

    @IsOptional()
    @IsString()
    plantDescription: string;

    @IsOptional()
    @IsString()
    imageUrl: string;

    @IsOptional()
    @IsString()
    sunlightPreference: string;

    @IsOptional()
    @IsInt()
    wateringIntervalSummer: number;

    @IsOptional()
    @IsInt()
    wateringIntervalWinter: number;

    @IsOptional()
    isToxicToPets: boolean;

    @IsOptional()
    lastWateredAt: Date | string | null;
}
