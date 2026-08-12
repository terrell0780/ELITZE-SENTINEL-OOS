// ElitzeStudioModule.h
// Unreal Engine module for Elitze World OS Compiler runtime integration

#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleInterface.h"
#include "Modules/ModuleManager.h"

class FElitzeStudioModule : public IModuleInterface
{
public:
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;
    
    static inline FElitzeStudioModule& Get()
    {
        return FModuleManager::LoadModuleChecked<FElitzeStudioModule>("ElitzeStudio");
    }
    
    static inline bool IsAvailable()
    {
        return FModuleManager::Get().IsModuleLoaded("ElitzeStudio");
    }
};

DECLARE_LOG_CATEGORY_EXTERN(LogElitzeStudio, Log, All);