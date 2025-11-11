---
date: 2023-10-18
title: Stable Diffusion提示词模板总结
category: Golang 
tags:
- AI
- Stable Diffusion
---
# Stable Diffusion 提示词模板总结

## 目录
- [基础规则](#基础规则)
- [通用结构](#通用结构)
- [分类模板](#分类模板)
  - [人物摄影](#人物摄影)
  - [风景摄影](#风景摄影)
  - [建筑摄影](#建筑摄影)
  - [产品摄影](#产品摄影)
  - [动物摄影](#动物摄影)
  - [抽象艺术](#抽象艺术)
- [进阶技巧](#进阶技巧)

## 基础规则

1. **权重设置**
   - 使用 `()` 增加权重，例如：`(keyword)`
   - 使用 `[]` 降低权重，例如：`[keyword]`
   - 使用 `(keyword:1.5)` 设置具体权重

2. **分隔符使用**
   - 使用逗号分隔不同元素
   - 使用分号分隔主要概念组

3. **否定提示词**
   - 在Negative提示词中添加不需要的元素
   - 常用否定词：`nsfw`, `blur`, `bad quality`, `deformed`

## 通用结构

```
[基础质量] + [风格] + [主体] + [细节描述] + [环境/背景] + [光线/氛围] + [构图] + [技术参数]
```

### 基础质量通用词
```
masterpiece, best quality, high resolution, 8k, highly detailed, sharp focus
```

### 技术参数通用词
```
RAW photo, film grain, Fujifilm XT3, 85mm lens, F1.8, ISO 100
```

## 分类模板

### 人物摄影

**基础模板**：
```
[画质] + [拍摄风格] + [人物特征] + [表情/姿势] + [服装] + [场景] + [光线] + [构图] + [相机参数]
```

**示例一：时尚人像**
```
masterpiece, best quality, photorealistic, (1 young asian woman:1.4), 
slim body, elegant pose, confident smile, 
wearing white silk dress, designer fashion, 
in urban environment, city background, 
golden hour lighting, bokeh, 
professional photography, fashion magazine style, 
Sony A7R4, 85mm lens
```

**示例二：生活写真**
```
high quality, detailed, natural lighting,
(1 girl:1.3), 20 years old, innocent face, gentle smile,
casual wear, white sweater, blue jeans,
coffee shop interior, sitting by window,
soft morning light, cinematic atmosphere,
documentary style photography
```

### 风景摄影

**基础模板**：
```
[画质] + [时间/天气] + [主要景观] + [环境细节] + [光线氛围] + [构图视角] + [相机参数]
```

**示例一：山景**
```
masterpiece, best quality, 8k resolution,
sunrise, clear sky, morning mist,
majestic mountain peaks, snow covered summits,
pine forest, alpine meadows, pristine lake reflection,
golden sunlight, atmospheric perspective,
wide angle shot, panoramic view,
landscape photography, Canon 5D Mark IV
```

**示例二：海景**
```
high quality, photorealistic,
sunset, partly cloudy,
tropical beach, turquoise ocean waves,
palm trees, white sand, coastal rocks,
dramatic sky, warm evening light,
leading lines, rule of thirds,
long exposure effect
```

### 建筑摄影

**基础模板**：
```
[画质] + [建筑类型] + [建筑风格] + [建筑细节] + [环境] + [光线] + [构图] + [技术参数]
```

**示例一：现代建筑**
```
best quality, architectural photography,
modern skyscraper, glass and steel structure,
geometric patterns, reflective surfaces,
urban setting, business district,
blue hour lighting, dramatic shadows,
symmetrical composition, low angle shot,
wide angle lens, tilt-shift effect
```

### 产品摄影

**基础模板**：
```
[画质] + [产品类型] + [产品特征] + [摆放方式] + [背景] + [光线] + [构图] + [特效]
```

**示例一：珠宝摄影**
```
highest quality, product photography,
diamond ring, platinum band,
floating in air, 45 degree angle,
pure black background,
studio lighting, rim light,
macro photography, sharp focus,
water drops, reflection
```

### 动物摄影

**基础模板**：
```
[画质] + [动物种类] + [动作姿态] + [环境] + [光线] + [情感/氛围] + [构图] + [技术细节]
```

**示例一：野生动物**
```
masterpiece, wildlife photography,
majestic tiger, prowling pose,
in jungle environment, morning fog,
dense vegetation, natural habitat,
dramatic lighting, golden hour,
eye level shot, shallow depth of field,
National Geographic style
```

## 进阶技巧

### 1. 权重调整示例
```
(主体:1.4), (重要特征:1.3), [次要元素:0.8]
```

### 2. 混合风格示例
```
(photorealistic:1.2), (oil painting:0.8), watercolor elements
```

### 3. 常用否定提示词模板
```
nsfw, nude, bad anatomy, bad hands, text, error, missing fingers, 
extra digit, fewer digits, cropped, worst quality, low quality, 
normal quality, jpeg artifacts, signature, watermark, username, blurry
```

### 4. 场景氛围增强
```
[基础模板] + cinematic, dramatic, atmospheric, moody, emotional
```

### 5. 光线效果强化
```
[基础模板] + volumetric lighting, god rays, rim light, subsurface scattering
```

## 实用提示

1. **渐进式优化**
   - 从基础模板开始
   - 逐步添加细节
   - 根据结果调整权重

2. **平衡度**
   - 避免过多关键词堆砌
   - 保持描述的连贯性
   - 注意正负提示词的配合

3. **实验性组合**
   - 尝试不同风格混合
   - 测试各种技术参数
   - 记录成功的组合

## 结语

提示词编写是一门艺术，需要不断实践和优化。建议保存效果好的模板，并根据具体需求进行调整。记住，最好的提示词是能够准确传达你的创作意图，同时给AI模型足够的创作空间。


