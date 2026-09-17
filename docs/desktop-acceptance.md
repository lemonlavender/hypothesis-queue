# Desktop acceptance / 桌面验收

**Passed for 1.0.0 / 1.0.0 已通过。** Tested on iPolloWork 0.50.12, macOS arm64, OpenCode engine and GPT-5.5. Synthetic data only; no research experiment was executed.

测试环境为 iPolloWork 0.50.12、macOS arm64、OpenCode 引擎和 GPT-5.5。仅使用模拟数据，没有执行科研实验。

| Check / 检查 | Observed result / 实际结果 |
|---|---|
| File import / 文件导入 | Native File picker accepted the declarative package; one UI resource installed and enabled. / 原生文件选择器通过声明式检查，UI 资源安装并启用。 |
| Panel connection / 面板连接 | Opened in a project task; bridge reported connected. / 项目任务中正常打开，通信显示已连接。 |
| Sample / 示例 | H1 → H4; 3.5 h used, 0.5 h remaining; H3 missing falsifier, method, owner. / 排队和缺失字段符合预期。 |
| Capacity / 工时预算 | 5 h selects H1 → H2; parking H1 selects H2 → H4; returning it restores H1 → H2. / 调整预算、暂存、恢复均符合预期。 |
| Observation / 结果记录 | Empty notes rejected; supplied inconclusive notes recorded and item removed from pending capacity. / 空记录被拒绝，填写后保存并移出待验证预算。 |
| Save regression / 保存回归 | Edited H1 prediction exported as “Zero unsupported claims in twenty synthetic questions.” and previous result became null. / 修改预测后导出新值，旧结果清除。 |
| Invalid import / 非法导入 | Negative budget rejected while preserving the existing queue. / 负预算被拒绝，当前队列保留。 |
| Filter and language / 筛选及语言 | Needs details showed H3 only; Chinese labels and narrow panel layout rendered correctly. / 待补信息仅显示 H3，中文和窄面板正常。 |
| Actual model tools / 真实工具 | Host called load_queue and get_queue; saved receipt, queue and Markdown match the planning module. / 真实工具调用后保存的回执、队列及 Markdown 与规划模块一致。 |
| Upgrade / 升级 | 1.0.0-beta.1 → 1.0.0 through File import, stable version enabled. / 文件导入完成预览版到稳定版升级并启用。 |
| Window reload / 窗口重载 | View → Reload; reopened panel connected and restored exported JSON. / 窗口重载后重新打开面板，导入导出过的 JSON 恢复成功。 |
| Uninstall/reinstall / 卸载重装 | Removed only this plugin, reinstalled the same 1.0.0 bytes, restored JSON and exported Markdown. / 只卸载本插件，同一稳定包重装后恢复与导出成功。 |
| Export preservation / 导出保留 | SHA-256 of all six beta/stable project outputs remained unchanged through the applicable lifecycle operations. / 六份预览及稳定版项目输出在后续生命周期操作中哈希保持一致。 |

## Actual outputs / 实际产物

- [desktop-plan.json](../examples/desktop-plan.json): complete structured receipt / 完整计划回执。
- [desktop-queue.json](../examples/desktop-queue.json): re-importable queue / 可重新导入的队列。
- [desktop-plan.md](../examples/desktop-plan.md): exact Markdown tool output / 工具返回的 Markdown。

These files were saved by the model from the installed plugin's real tool responses. JSON objects were compared structurally with the sample's expected result; Markdown was compared after trimming the final newline. The public filenames differ from the local acceptance filenames; contents are unchanged.

以上文件来自已安装插件的真实工具返回，由模型保存。JSON 按对象结构核对，Markdown 仅忽略末尾换行进行比较。公开文件名与本地验收文件名不同，内容不变。

## Issue found and resolved / 发现并修复的问题

The preview used a form submit for Save hypothesis. The host iframe does not permit form submission, so the editor displayed new text without committing it. Version 1.0.0 uses an explicit click handler. The regression was reproduced in the preview and retested in the installed stable package, including exported data and outcome invalidation.

预览版通过表单提交保存假设，但宿主 iframe 不允许提交表单，导致编辑框有新值、实际队列未更新。1.0.0 改为明确的按钮事件。已在预览版复现，并在安装后的稳定版复测导出数据与旧结果清除。

## Local checks and scope / 本地检查与范围

15 automated tests passed, covering validation, completeness, ranking, capacity, outcomes, design edits, exports, deterministic archive bytes and built script syntax. The root manifest also passed the upstream schemaVersion 2 parser.

15 项自动检查通过，覆盖字段校验、完整度、排序、预算、结果、设计修改、导出、确定性归档及脚本语法；根清单通过上游 schemaVersion 2 解析器。

Panel state is in memory: export before closing, reloading, upgrading or uninstalling, then import the saved queue. Lifecycle success refers to the observed operations above, not full application process restart. Other platforms/engines, live research, statistical validity and external integrations were not tested. Release SHA256SUMS identifies the packaged deliverables.

面板状态保存在内存中：关闭、重载、升级或卸载前先导出，再导入保存的队列。生命周期验收仅指上表操作，不含完整进程重启。其他平台或引擎、真实科研、统计有效性及外部集成未验证。Release 的 SHA256SUMS 标识交付文件。
