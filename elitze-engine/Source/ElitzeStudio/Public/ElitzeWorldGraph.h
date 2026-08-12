// ElitzeWorldGraph.h
// Consumes Gaming Compiler JSON blueprint → builds Unreal World Graph
// Landscape layers, PCG volumes, Companion Guard components

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "Engine/Landscape.h"
#include "PCGComponent.h"
#include "ElitzeWorldGraph.generated.h"

UENUM(BlueprintType)
namespace EElitzeWorldScale
{
    enum Type
    {
        Small_2KM  = 2048,
        Medium_4KM = 4096,
        Large_8KM  = 8192,
    };
}

UENUM(BlueprintType)
namespace EElitzeSecurityTier
{
    enum Type
    {
        Standard,
        Hardened,
        Cyberpunk_Grid_Deception
    };
}

USTRUCT(BlueprintType)
struct FElitzeGeologicalLayer
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    FString LandscapeResolution;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> EditLayers;
    
    UPROPERTY(BlueprintReadWrite)
    FString HeightmapSource; // "google_earth_engine"
};

USTRUCT(BlueprintType)
struct FElitzeCyberInfrastructure
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    float VoronoiGridMeshDensity;
    
    UPROPERTY(BlueprintReadWrite)
    EElitzeSecurityTier::Type EncryptionComplexity;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> NetworkTopologies;
};

USTRUCT(BlueprintType)
struct FElitzeCompanionProfile
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    FString SystemClass;
    
    UPROPERTY(BlueprintReadWrite)
    FString AssignedSkinPreset;
    
    UPROPERTY(BlueprintReadWrite)
    bool bSingletonEnforced;
};

USTRUCT(BlueprintType)
struct FElitzeGeospatialLayer
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    bool bMCPServerActive;
    
    UPROPERTY(BlueprintReadWrite)
    FString ImagerySource;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> GroundedLocations;
};

USTRUCT(BlueprintType)
struct FElitzeUnrealCppBinding
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    FString FileName;
    
    UPROPERTY(BlueprintReadWrite)
    FString SourceRaw;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> CompilationTargets;
    
    UPROPERTY(BlueprintReadWrite)
    FString ClassName;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> Includes;
};

USTRUCT(BlueprintType)
struct FElitzeUnityCSharpBinding
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    FString FileName;
    
    UPROPERTY(BlueprintReadWrite)
    FString SourceRaw;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> CompilationTargets;
    
    UPROPERTY(BlueprintReadWrite)
    FString ClassName;
    
    UPROPERTY(BlueprintReadWrite)
    FString Namespace;
};

USTRUCT(BlueprintType)
struct FElitzeEngineBindings
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FElitzeUnrealCppBinding> UnrealCppBindings;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FElitzeUnityCSharpBinding> UnityCSharpBindings;
};

USTRUCT(BlueprintType)
struct FElitzeMythosValidation
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    bool bCompanionSingletonRuleVerified;
    
    UPROPERTY(BlueprintReadWrite)
    bool bCppHeaderSyntaxValid;
    
    UPROPERTY(BlueprintReadWrite)
    bool bCSharpClassSyntaxValid;
    
    UPROPERTY(BlueprintReadWrite)
    TArray<FString> IPSanitizationApplied;
};

USTRUCT(BlueprintType)
struct FElitzeWorldBlueprint
{
    GENERATED_BODY()
    
    UPROPERTY(BlueprintReadWrite)
    FString BlueprintID;
    
    UPROPERTY(BlueprintReadWrite)
    int64 Seed;
    
    UPROPERTY(BlueprintReadWrite)
    int32 ScaleMeters;
    
    UPROPERTY(BlueprintReadWrite)
    FElitzeGeologicalLayer GeologicalLayer;
    
    UPROPERTY(BlueprintReadWrite)
    FElitzeCyberInfrastructure CyberInfrastructure;
    
    UPROPERTY(BlueprintReadWrite)
    FElitzeCompanionProfile AICompanionProfile;
    
    UPROPERTY(BlueprintReadWrite)
    FElitzeGeospatialLayer GeospatialLayer;
    
    UPROPERTY(BlueprintReadWrite)
    FElitzeEngineBindings TargetEngineBindings;
    
    UPROPERTY(BlueprintReadWrite)
    FElitzeMythosValidation MythosValidation;
};

UCLASS(Blueprintable, BlueprintType)
class ELITZESTUDIO_API UElitzeWorldGraph : public UObject
{
    GENERATED_BODY()
    
public:
    // Import from Gaming Compiler JSON output
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    static bool ImportFromJSON(const FString& JSONPath, FElitzeWorldBlueprint& OutBlueprint);
    
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    static bool ImportFromString(const FString& JSONString, FElitzeWorldBlueprint& OutBlueprint);
    
    // Build landscape from geological layer
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    bool BuildLandscape(ALandscape* TargetLandscape, const FElitzeGeologicalLayer& Geology);
    
    // Create PCG volume for cyber infrastructure
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    bool CreatePCGVolume(UPCGComponent* PCGComponent, const FElitzeCyberInfrastructure& Cyber);
    
    // Spawn companion guard system
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    class AActor* SpawnCompanionGuard(const FElitzeCompanionProfile& Profile, const FTransform& Transform);
    
    // Apply geospatial grounding (MCP/Google Earth)
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    bool ApplyGeospatialGrounding(const FElitzeGeospatialLayer& Geo);
    
    // Compile engine bindings to disk (for IDE integration)
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    bool CompileEngineBindings(const FString& OutputDirectory);
    
    // Validate mythos constraints
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    bool ValidateMythos(const FElitzeMythosValidation& Validation, TArray<FString>& OutWarnings);
    
    // Getters
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    const FElitzeWorldBlueprint& GetBlueprint() const { return WorldBlueprint; }
    
    UFUNCTION(BlueprintCallable, Category = "Elitze|World Graph")
    FString GetProvenanceHash() const;

protected:
    UPROPERTY()
    FElitzeWorldBlueprint WorldBlueprint;
    
    // Helper: Create landscape edit layer
    bool CreateEditLayer(ALandscape* Landscape, const FString& LayerName);
    
    // Helper: Import heightmap from Google Earth Engine data
    bool ImportHeightmap(ALandscape* Landscape, const FString& HeightmapData);
    
    // Helper: Write generated C++ header to disk
    bool WriteGeneratedHeader(const FElitzeUnrealCppBinding& Binding, const FString& OutputDir);
};