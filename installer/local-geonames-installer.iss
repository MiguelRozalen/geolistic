[Icons]
Name: {commonprograms}\{groupname}\{cm:UninstallProgram,Local Geonames Manager}; Filename: {uninstallexe}; IconFilename: {app}\iconCircle.ico
;Name: {commonprograms}\{groupname}\Local Geonames Manager; Filename: {app}\quizard-launcher.bat; WorkingDir: {app}; IconFilename: {app}\iconCircle.ico

[Setup]
OutputDir=.\bin\
SourceDir=.
OutputBaseFilename=localgeonamesmanager
VersionInfoVersion=0.8.5
VersionInfoCompany=Seshat
VersionInfoDescription=Local Geonames Manager
VersionInfoTextVersion=0.8.5
VersionInfoCopyright=Copyright dTinf - Seshat
AppCopyright=© Seshat 2018
AppName=Local Geonames Manager
AppVerName=Local Geonames Manager 0.8.5
PrivilegesRequired=admin
LicenseFile=gpl.rtf
MinVersion=0,5.0.2195
RestartIfNeededByRun=false
DisableDirPage=false
DefaultDirName=\geonames\local-geonames-manager
DisableProgramGroupPage=false
AlwaysShowComponentsList=false
ShowComponentSizes=false
FlatComponentsList=false
UsePreviousSetupType=false
WizardImageBackColor=clWhite
SetupIconFile=.\iconCircle.ico
AppPublisher=Seshat
AppPublisherURL=https://github.com/MiguelRozalen/local-geonames-manager
AppSupportURL=https://github.com/MiguelRozalen/local-geonames-manager
AppUpdatesURL=https://github.com/MiguelRozalen/local-geonames-manager
AppVersion=0.8.5
AppID={{4C2A0D0F-B9A4-4F58-B9BD-8F83DCF2C6B0}
UninstallDisplayIcon={app}\iconCircle.ico
UninstallDisplayName=Local Geonames Manager
AppComments=Local Geonames Manager Uninstaller
AppContact=+34 622 22 22 22
DisableFinishedPage=false
WizardImageFile=.\portrait_big.bmp
WizardSmallImageFile=.\portrait_small.bmp
DefaultGroupName=\geonames\local-geonames-manager

[Dirs]
Name: {app}\; Permissions: users-modify

[Files]
; Icons
Source: .\iconCircle.ico; DestDir: {app}; Languages: 
; file folder
Source: ..\data\*; DestDir: {app}\data\; Flags: ignoreversion createallsubdirs recursesubdirs
Source: ..\lib\*; DestDir: {app}\lib\; Flags: ignoreversion createallsubdirs recursesubdirs
Source: ..\LICENSE; DestDir: {app}
Source: ..\local-geonames-manager-cli.js; DestDir: {app}
Source: ..\package.json; DestDir: {app}
Source: ..\README.md; DestDir: {app}  
Source: ..\local-geonames-launcher-install.bat; DestDir: {app}
Source: .\iconCircle.ico; DestDir: {app}

[Run]
Filename: "{app}\lib\local-geonames-launcher-install.bat"; Parameters: "install"; Flags: runhidden

[Code]
const
	AppID = '{4C2A0D0F-B9A4-4F58-B9BD-8F83DCF2C6B0}'; //AppId del cliente de instalador

procedure CurStepChanged(CurStep: TSetupStep);
var
  RC: integer;
  SIn,SOut: String;
begin

end;
