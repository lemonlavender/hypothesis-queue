# Queue format / 队列格式

The root is an object with exactly these fields. Unknown fields are rejected.
根对象使用以下字段；未知字段会报错，不会静默丢弃。

| Field | Meaning / 含义 |
|---|---|
| `schemaVersion` | Exactly 1 / 固定为 1 |
| `title` | Required nonempty text / 必填非空文本 |
| `budgetHours` | Number 0–10000, step 0.25 / 数字 0 至 10000，步长 0.25 |
| `hypotheses` | Array, 0–100 objects / 数组，最多 100 项 |

Each hypothesis / 每个假设：

| Field | Meaning / 含义 |
|---|---|
| `id` | Unique 1–40 ASCII letters, digits, underscore or hyphen; first character letter/digit / 唯一 ID，首位字母或数字 |
| `claim` | Required nonempty hypothesis / 必填非空假设 |
| `source` | Supplied basis or evidence reference / 已提供的依据或证据引用 |
| `prediction` | Observable expected result / 可观测预期结果 |
| `falsifier` | Observation contradicting the prediction / 能否定预测的观测 |
| `method` | Proposed validation procedure / 验证步骤 |
| `owner` | Responsible person or team / 负责人或团队 |
| `hours` | Null if unknown; otherwise 0.25–10000 in 0.25 steps / 未知填 null，否则按 0.25 步长 |
| `priority` | Integer 1, 2 or 3; 1 first / 整数 1、2、3，1 优先 |
| `parked` | Optional boolean, default false / 可选布尔值，默认 false |
| `result` | Optional null or {outcome, notes} / 可选 null 或结果对象 |

Source, prediction, falsifier, method and owner may be absent or blank, retaining an incomplete item. Omitted effort becomes null. Every text field is limited to 4000 characters; numbers are not coerced from strings. Manual JSON import is limited to 1 MiB.

来源、预测、否定条件、方法和负责人可省略或为空，以保留待完善项。省略工时变为 null。每个文本字段最多 4000 字符，数字字符串不自动转换。手动 JSON 导入上限为 1 MiB。

A result requires outcome **supports**, **contradicts** or **inconclusive**, plus nonempty notes. An imported outcome remains recorded even when planning fields are incomplete; the receipt continues to show missing fields. Editing a claim, source, prediction, falsifier or method clears its old outcome.

结果 outcome 只能为 supports、contradicts 或 inconclusive，notes 必须非空。导入时即使计划字段不完整，已有结果仍保留，回执继续显示缺失字段。修改假设、来源、预测、否定条件或方法会清除旧结果。

The get_queue receipt contains queue, items, selectedIds, counts, budgetHours, usedHours, remainingHours and policy. Items retain input order; selectedIds is scheduling order. Import only its queue field. JSON export already provides this field alone.

工具回执的 items 保留输入顺序，selectedIds 为实际排队顺序。恢复回执时仅导入 queue 字段；JSON 导出已单独提供该字段。
