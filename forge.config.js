module.exports = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [
        //{
        //    name: '@electron-forge/maker-squirrel',
        //    config: {},
        //},
        //{
        //    name: '@electron-forge/maker-zip',
        //    platforms: ['darwin'],
        //},
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    maintainer: '一剑隔世',
                    homepage: 'https://code.example',
                }
            },
        },
        //    {
        //      name: '@electron-forge/maker-rpm',
        //      config: {},
        //    },
    ],
};
