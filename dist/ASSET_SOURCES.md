# 素材来源 / Asset sources

本项目目前使用网上获取的经典《植物大战僵尸》场景、角色、卡片和音效作为开发素材，尚未替换奶蛙美术。

- Jasmine709 / Plants-VS-Zombies-Game: https://github.com/Jasmine709/Plants-VS-Zombies-Game — 背景、植物与僵尸 GIF、卡片、阳光、割草机和战斗特效。
- aayush-musyaju / plant-vs-zombies: https://github.com/aayush-musyaju/plant-vs-zombies — 坚果、土豆地雷图集、卡片、铲子和音效。
- 原角色与原游戏美术、音效归 PopCap / Electronic Arts 等原权利方所有。本项目不是官方版本。

动画 GIF 在本地转换为 PNG 图集，以便与暂停和倍速同步。未引入上述项目的游戏逻辑代码；战斗引擎、界面交互、关卡和素材加载器在本项目内实现。

后续替换奶蛙素材时，修改 assets/manifest.json 及植物/僵尸的素材对应项即可，战斗坐标和规则独立于图像。

## 经典界面与草皮过场（2026-10 更新）

- https://github.com/ZhuZhengyi/jspvz — 原版菜单背景、冒险按钮、菜单石板、草皮卷与端面、裸土院子、启动图片、图鉴、阳光与波次 UI。复制图片，不引入该项目游戏代码。
- https://github.com/jiangnangame/New-Plants-vs-Zombies-JavaScript — 挑战页边框、准备/开始文字图、少量界面补充素材。复制图片，不引入该项目游戏代码。
- 美术版权属于 PopCap / EA；以上仓库是本项目获取素材的来源，不意味着素材版权转让。
- UI 位于 assets/ui/；草皮动画与界面交互由本项目代码实现。
