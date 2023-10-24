const core = require('@actions/core')
const process = require('process')
const path = require('path')
const spawn = require('child_process').spawnSync

try {
    // this job has nothing to do on non-Windows platforms
    if (process.platform != 'win32') {
        process.exit(0)
    }

    const arch = core.getInput('arch') || 'amd64'
    const hostArch = core.getInput('host_arch') || ''
    const toolsetVersion = core.getInput('toolset_version') || ''
    const winsdk = core.getInput('winsdk') || ''
    const vswhere = core.getInput('vswhere') || 'vswhere.exe'
    const components = core.getInput('components') || 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64'

    const vsInstallerPath = path.win32.join(process.env['ProgramFiles(x86)'], 'Microsoft Visual Studio', 'Installer')
    const vswherePath = path.win32.resolve(vsInstallerPath, vswhere)

    console.log(`vswhere: ${vswherePath}`)

    const requiresArg = components
        .split(';')
        .filter(s => s.length != 0)
        .map(comp => ['-requires', comp])
        .reduce((arr, pair) => arr.concat(pair), [])

    const vswhereArgs = [
        '-latest',
        '-products', '*',
        '-property', 'installationPath',
    ].concat(requiresArg)

    console.log(`$ ${vswherePath} ${vswhereArgs.join(' ')}`)

    const vswhereResult = spawn(vswherePath, vswhereArgs, {encoding: 'utf8'})
    if (vswhereResult.error) throw vswhereResult.error
    const installPathList = vswhereResult.output.filter(s => !!s).map(s => s.trim())
    if (installPathList.length == 0) throw new Error('Could not find compatible VS installation')

    const installPath = installPathList[installPathList.length - 1]
    console.log(`install: ${installPath}`)
    core.setOutput('install_path', installPath)

    const vsDevCmdPath = path.win32.join(installPath, 'Common7', 'Tools', 'vsdevcmd.bat')
    console.log(`vsdevcmd: ${vsDevCmdPath}`)

    const vsDevCmdArgs = [ vsDevCmdPath, `-arch=${arch}` ]
    if (hostArch != '')
        vsDevCmdArgs.push(`-host_arch=${hostArch}`)
    if (toolsetVersion != '')
        vsDevCmdArgs.push(`-vcvars_ver=${toolsetVersion}`)
    if (winsdk != '')
        vsDevCmdArgs.push(`-winsdk=${winsdk}`)
    
    const cmdArgs = [ '/q', '/k'].concat(vsDevCmdArgs, ['&&', 'set'])

    console.log(`$ cmd ${cmdArgs.join(' ')}`)

    const cmdResult = spawn('cmd', cmdArgs, {encoding: 'utf8'})
    if (cmdResult.error) throw cmdResult.error
    const cmdOutput = cmdResult.output
        .filter(s => !!s)
        .map(s => s.split('\n'))
        .reduce((arr, sub) => arr.concat(sub), [])
        .filter(s => !!s)
        .map(s => s.trim())

    const completeEnv = cmdOutput
        .filter(s => s.indexOf('=') != -1)
        .map(s => s.split('=', 2))
    const newEnvVars = completeEnv
        .filter(([key, _]) => !process.env[key])
    const newPath = completeEnv
                        .filter(([key, _]) => key == 'Path')
                        .map(([_, value]) => value)
                        .join(';');

    for (const [key, value] of newEnvVars) {
        core.exportVariable(key, value)
    }
    core.exportVariable('Path', newPath);

    console.log('environment updated')
} catch (error) {
    core.setFailed(error.message);
}
