using UnrealBuildTool;

public class ElitzeStudio : ModuleRules
{
    public ElitzeStudio(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        
        PublicDependencyModuleNames.AddRange(new string[] {
            "Core", "CoreUObject", "Engine", "InputCore",
            "Landscape", "ProceduralMeshComponent", "Json", "JsonUtilities",
            "PCG", "DeveloperSettings"
        });
        
        PrivateDependencyModuleNames.AddRange(new string[] {
            "Projects", "RenderCore", "RHI", "ShaderCore"
        });
        
        PublicIncludePaths.AddRange(new string[] {
            ModuleDirectory + "/Public"
        });
        
        if (Target.Type == TargetRules.TargetType.Editor)
        {
            PublicDependencyModuleNames.AddRange(new string[] {
                "UnrealEd", "ToolMenus", "EditorScriptingUtilities", "EditorSubsystem"
            });
        }
    }
}