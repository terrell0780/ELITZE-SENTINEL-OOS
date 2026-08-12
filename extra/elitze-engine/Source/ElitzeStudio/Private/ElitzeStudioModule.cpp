// ElitzeStudioModule.cpp
// Runtime integration for Gaming Compiler JSON → Unreal Engine

#include "ElitzeStudioModule.h"
#include "Engine/Landscape.h"
#include "LandscapeEdit.h"
#include "JsonObjectConverter.h"
#include "Misc/FileHelper.h"
#include "HAL/PlatformFilemanager.h"

DEFINE_LOG_CATEGORY(LogElitzeStudio);

#define LOCTEXT_NAMESPACE "ElitzeStudio"

void FElitzeStudioModule::StartupModule()
{
    UE_LOG(LogElitzeStudio, Log, TEXT("Elitze Studio Module initialized - Gaming Compiler runtime integration active"));
}

void FElitzeStudioModule::ShutdownModule()
{
    UE_LOG(LogElitzeStudio, Log, TEXT("Elitze Studio Module shutdown"));
}

#undef LOCTEXT_NAMESPACE