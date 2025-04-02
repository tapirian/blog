# 如何导出和安装 VSCode 插件

## 方法1. 导出插件列表再安装
### 导出插件

在旧电脑上，打开 VSCode 并按以下步骤操作：

- 打开终端（Ctrl + `）。
- 使用以下命令导出已安装插件的列表：

  ```bash
  code --list-extensions > extensions-list.txt
  ```

这会将所有已安装的插件名称保存到 `extensions-list.txt` 文件中。

### 在新电脑上安装插件

将 \`extensions-list.txt\` 文件传输到新电脑（可以通过任何方式，如 USB 或云存储等）。

然后，在新电脑上，打开 VSCode 并执行以下命令来安装所有插件：

- 打开终端（Ctrl + `）。
- 运行以下命令来批量安装插件：

  ```bash
  cat extensions-list.txt | xargs -L 1 code --install-extension
  ```

这会根据列表中的插件名称，自动安装所有插件。xargs命令会将输出作为参数传入下面的命令。`-L 1`表示每行都作为参数传入

## 方法2. 自动同步设置（可选）

如果你想同步 VSCode 的设置（包括主题、快捷键等），可以使用 VSCode 自带的 **Settings Sync** 功能：

1. 在旧电脑上，打开 VSCode。
2. 点击左下角的用户图标，然后选择 **Turn on Settings Sync**。
3. 登录你的 GitHub 或 Microsoft 账户进行同步。
4. 在新电脑上，登录同一个账户，VSCode 会自动同步你的设置和插件。

这样，你的新电脑就会安装和配置好你在旧电脑上的所有插件和设置。
