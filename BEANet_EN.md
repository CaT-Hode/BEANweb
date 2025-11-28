# BEANet: Pushing the Limits of Efficient Binary Neural Networks

## Abstract

> Binary Neural Networks (BNNs) represent an extreme network quantization approach, binarizing weights and activations to replace costly matrix-vector multiplications with efficient XNOR and Bit Count operations. Despite drastic reductions in model size and computational cost, a significant performance gap persists compared to full-precision DNNs, limiting their adoption in edge and mobile computing. We bridge this gap via three key contributions: (1) we introduce **Optimized Adaptive Binarization** to minimize quantization error and facilitate efficient NAND-based hardware implementation; (2) we propose a novel **Exponential Straight-Through Estimator (ExSTE)** that markedly improves BNN training stability; and (3) we present the **Binary Enhanced Adaptive Network (BEANet)**, a novel architecture designed with "Attention+FFN" mechanism. Extensive experiments on CIFAR-10 and ImageNet show BEANet achieves state-of-the-art accuracy among similarly scaled BNNs. Notably, BEANet-Large surpasses the previous leading BNext-S by 1.0% on ImageNet, using 36% fewer parameters and 2% fewer OPs. These results underscore the substantial potential of BEANet for efficient, high-performance deployment in resource-constrained scenarios.

## Introduction

<img src="C:\Users\a8789\OneDrive\文档\params-vs-acc.svg" alt="params-vs-acc" style="zoom:50%;" />

*Figure 1. Model parameters vs. accuracy, comparing the SOTA binary neural network on ImageNet with our BEANet.* 

In recent years, large‑scale models have achieved breakthrough performance in natural‑language processing [1,2,11] and computer vision [3-6,10], showing impressive performance and wide application prospects. These modern neural network architectures are usually accompanied by higher computational and memory overheads, limiting their practical deployment on resource‑constrained devices, such as mobile phones, mini robots and MR glasses. Therefore, model‑compression technologies have become an important research direction, including quantization [47,48,53], pruning [49], hashing [50,51], model‑architecture design [7,8] and knowledge distillation [9].

Among many compression methods, quantization reduces memory usage, energy consumption and inference latency by lowering the bit‑width of model parameters and activations, while maintaining hardware friendliness and significantly cutting storage and computational complexity. At present, quantization methods such as float16, int8, and int4 have been widely applied in model slimming for large models. As the extreme form of quantization, Binary Neural Networks (BNNs) require both weights and activations to be $\{-1, +1\}$. This replaces conventional multiply–accumulate (MAC) with XNOR-BitCount operation, yielding large reductions in parameter size and compute. Previous BNN research [13-15] motivated by the fact that one 64-bit CPU register can do 64 BOPs in one cycle, typically defines the total mixed-precision operations (OPs) as $\text{OPs} = \text{FLOPs} + \frac{1}{64}\text{BOPs}$, reflecting the efficiency gains of binary operations (BOPs) compared to floating-point operations (FLOPs). According to XNOR‑Net [13], BNNs can provide $32\times$ memory compression and $58\times$ CPU acceleration on specific tasks.

Although BNNs have great potential in inference speed and energy efficiency, a significant accuracy gap remains between them and full‑precision models. The non‑differentiability of the sign function at zero causes gradient truncation, making traditional back‑propagation algorithms difficult to apply directly. BinaryConnect [16] first proposed the straight‑through estimator (STE), approximating the gradient of the sign function during back‑propagation to alleviate the inconsistency between forward and backward processes. In order to further narrow the gap between BNNs and full‑precision models, many studies have explored binarization strategies [18-20], STE variants [21-23], and network structures; some works simply binarize the classic ResNet [3] framework, while loss‑landscape analysis [24] shows that the gradient smoothness of ResNet is not always suitable for binarization and training requirements, so network‑structure design specifically for BNNs [24-27] remains a mainstream research trend.

In this work, focusing on the core difficulties of binarization error and gradient instability in BNNs, we propose **B**inary **E**nhanced **A**daptive **Net**work (BEANet). By integrating adaptive binarization methods, a new exponential‑based STE, and a lightweight convolutional processor combines residual and DenseNet structure, we aim to strike an excellent balance among model size, computational complexity, and accuracy, achieving SOTA performance under the same parameter level on ILSVRC‑2012 ImageNet dataset. We first optimize and extend the binarization strategy from AdaBin [18] and propose a hardware acceleration scheme that replaces XNOR with NAND operations, achieving the minimal quantization error while theoretically reducing transistors by a factor of approximately $2.5\times$ without additional computational overhead. We then propose an exponential straight‑through estimator (ExSTE) based on previous STE‑optimization studies, achieving higher accuracy than existing methods on CIFAR‑10. Finally,  we design the Adaptive Channel Enhancement (ACE) convolution processor and implement an "Attention+FFN" mechanism similar to ConvNeXt [4]. To enhance generalization and accelerate convergence, we introduce multi‑teacher hard knowledge distillation during training, using one fixed main teacher with corrected inconsistent predictions by ground‑truth (GT) mask, and several assistant teachers selected adaptively by a shifted window, pushing the model to a new level of accuracy.

Our main contributions are summarized as follows:

1. **Optimized Adaptive Binarization method and corresponding Convolution (ABConv).** A new binarization method that greatly reduces quantization error and allows more flexible hardware implementation with NAND gates.
2. **Exponential Straight‑Through Estimator (ExSTE).** A new gradient‑passing function with few segments, continuous transformation, and low computational cost, providing more stable and higher training accuracy with various binarization strategies.
3. **Binary Enhanced Adaptive Network (BEANet).** A novel binary neural network architecture that combines residual and DenseNet ideas, achieving an excellent balance between efficiency and accuracy.
4. **Multi‑teacher Hard Knowledge Distillation.** A one‑main plus multiple‑assistant teacher group incorporating ground‑truth knowledge to further improve the convergence and generalization capability of BNNs.

With these four improvements, our work shows the best performance among BNN models of the same scale on the ILSVRC‑2012 ImageNet benchmark (Fig. 1), providing new insights and potential value for deploying binary networks in real‑world applications.

## Related Works

**Binarization.**
According to the IEEE‑754 standard, a 32‑bit floating‑point number can encode $2^{32}$ distinct states, whereas a 1‑bit representation can only express two values $\{-1,+1\}$, severely limiting representational capacity. Early works such as BinaryConnect [16] and BinaryNet [17] pioneered sign‑based binarization but suffered significant accuracy degradation compared to their 32‑bit counterparts. To bridge this gap, XNOR‑Net [13] introduced learnable channel‑wise scaling factors to better approximate full‑precision convolution in the binary domain. ABC‑Net [28] employs multiple binary weight/activation bases with implicit scaling factors to reduce quantization error; Real‑to‑Binary [29] uses data‑driven channel re‑scaling based on pre‑activation statistics; SD‑BNN [30] adapts binarization thresholds via high‑order activation statistics; AdaBin [18] dynamically adjusts thresholds per layer and sample; and INSTA‑BNN [19] leverages instance‑aware control of thresholds at the cost of additional compute.

**Gradient Approximation.**
The non‑differentiability of the sign function at zero renders standard backpropagation ineffective. BinaryConnect [16] first introduced the straight‑through estimator (STE) to approximate the sign’s gradient. Bi‑Real Net [15] refined this with a piecewise STE for closer fitting; IR‑Net [22] proposed an Error Decay Estimator (EDE) to progressively approximate the sign over different training phases; RBNN [21] further adds dynamic adjustment of the valid gradient range; and ReSTE [23] adopts a power‑based correction term to balance approximation error and gradient stability.

**Binary Neural Network Design Optimization.**
To enhance the expressive power of binary convolutions, various architectural innovations have been explored. Bi‑Real Net [Bi‑Real‑Net] adds extra shortcut connections within residual blocks; BinaryDenseNet [25] integrates DenseNet‑style dense connections; MeliusNet [26] introduces Melius layer for deeper channel fusion; Real2BinaryNet [29] adopts a three‑stage conversion from full‑precision to binary and incorporates Squeeze‑and‑Excitation (SE) [11] for channel re‑weighting; PokeBNN [PokeBNN] proposes DPReLU activations alongside a progressive binarization schedule; and BNext [BNext] brings ConvNeXt [4,5] design into BNNs, adds multiplicative shortcuts, and combines knowledge distillation with advanced augmentation for superior accuracy.

**Knowledge Distillation.**
Knowledge Distillation (KD) [9] transfers soft‑label information from a high‑capacity teacher to improve student model training. In the BNN domain, KD has been applied in [14,24,27,29]. However, many studies[54-56] highlight that large capacity gaps between teacher and student can impede distillation, necessitating student‑friendly teacher design and complexity‑aware metrics. To address this, BNext [24] introduces multi‑teacher soft distillation and a Knowledge Complexity index to balance accuracy and model complexity, mitigating overfitting and enhancing generalization.

## 3 Preliminaries

### Definition of Binary Neural Networks

BNNs differ from full‑precision Deep Neural Networks (DNNs) in that both activations $a$ and weights $w$ are quantized to the two values $\{-1,+1\}$, turning expensive floating‑point multiply–add operations into efficient bit‑level computations. The binarization function is defined as:

$$
\mathcal{B}(x)=Sign(x)=\left\{\begin{array} \ -1 , & x<0 \\+1, & x\geq 0\end{array}\right.\tag{1}
$$

Where $x$ denotes the input values, such as activation and weight tensors. During inference, BNNs replace standard multiplications and additions with bit‑wise XNOR and BitCount operations. Following XNOR‑Net [XNOR‑Net], when both activation and weight are binarized by sign function and lie in $\{-1,+1\}$, they are first mapped to $\{0,1\}$, then processed by bit‑wise XNOR and BitCount to approximate the full‑precision dot‑product. Let $\beta_c$ be a learnable channel‑wise scaling factor, the resulting binary convolution is

$$
y = \beta_c \cdot\bigl(\mathcal B(a)\,\bigotimes\,\mathcal B(w)\bigr) \tag{2}
$$

where $\bigotimes$ represents the convolution with XNOR + BitCount operator, and $a/w$ denote the 32-bit full-precision activation/weight tensors, respectively.

### Gradient Backpropagation with Straight‑Through Estimator

While binarization greatly reduces computational cost, sign function is non‑differentiable at zero and has zero gradients elsewhere, causing standard backpropagation no longer available. To enable end‑to‑end training, BinaryConnect [BinaryConnect] introduced the Straight‑Through Estimator (STE), which replaces the true gradient of sign function with the estimator function $F_{\mathrm{STE}}$ during backpropagation:

$$
\frac{\partial \mathcal{L}}{\partial x} = \frac{\partial \mathcal{L}}{\partial \mathcal{B}(x)}\cdot \frac{\partial \mathcal{B}(x)}{\partial x}\simeq \frac{\partial \mathcal{L}}{\partial \mathcal{B}(x)}\cdot \frac{\partial F_{STE}(x)}{\partial x}\tag{3}
$$

$$
\frac{\partial F_{STE}(x)}{\partial x}=F'_{\mathrm{STE}}(x) = \mathbf{1}_{|x|\le1.5} \tag{4}
$$

$\mathcal{L}$ is the loss value and $\mathbf{1}_{|x|\leq1.5}$ is an indicator function, which is 1 only if $|x|\leq1.5$ and 0 otherwise. STE solves the backpropagation problem of binarization at the cost of approximation error, laying the foundation for various subsequent optimization works [22-24].

## Methodology

### Optimized Adaptive Binarization

Sign function is the core mechanism for 1‑bit quantization but introduces considerable quantization error. XNOR‑Net [13] mitigates this by adding a channel‑wise scaling factor after linear or convolution operation, narrowing the gap between binary and full‑precision convolutions. Although this approach has proven somewhat effective, it cannot fully eliminate the instability and accuracy degradation introduced by the sign function.

Building on AdaBin [18], we propose an improved and extended Adaptive Binarization method: before applying the sign function, we inject learnable or analytically derived scaling ($\alpha$) and bias ($\beta$) factors for activations and weights, thus driving the quantization error toward its theoretical minimum. Formally, this method is defined as:
$$
\mathcal{B}(x)=\left\{\begin{array}{ll}
\beta-\alpha, & x<\beta \\
\beta+\alpha, & x \geq \beta
\end{array}\right.=\alpha\cdot Sign(x-\beta)+\beta \tag{5}
$$
Below, we detail separate optimization schemes for weights and activations, denoted $\alpha_w/\beta_w$ and $\alpha_a/\beta_a$, respectively.

**Weight Binarization.**  In order to quantify the error before and after binarization, the Quantization Error (QE) based on square error is usually used:
$$
QE=\sum_{i}^{N}(w_i-\mathcal{B}(w_i))^2=\sum_{i=0}^{N}\left(w_i-\alpha_w w_i^b -\beta_w\right)^2 \tag{6}
$$
Where $N=K_hK_wC_k$ is the element number of weight, and $w_i^b = \mathrm{Sign}(w_i - \beta_w)$ is the binary weight under adaptive binarization. Minimizing $QE$ gives the optimal $\alpha_w$ and $\beta_w$, and $QE$ can be shown to be convex for both variables. The partial derivatives of QE with respect to $\alpha_w$ and $\beta_w$ are:

$$
\begin{align}
\frac{\partial QE}{\partial \alpha_w}
  &= -2 \Bigl( \sum_{i}^{N} w^b_i w_i
      - \alpha_w \sum_{i}^{N} (w^b_i)^2
      - \beta_w \sum_{i}^{N} w^b_i \Bigr) \notag\\
  &= -2 \Bigl(\sum_{i}^{N}(w_i-\beta_w+\beta_w)\cdot Sign(w_i-\beta_w)
      - \alpha_w N
      - \beta_w \sum_{i}^{N} w^b_i\Bigr) \notag\\
  &= 2 \bigl( N\alpha_w - \lVert w-\beta_w\rVert_1 \bigr)
    \tag{7}\\
\frac{\partial QE}{\partial \beta_w}
  &= -2\sum_{i}^{N} \bigl( w_i - \alpha_w w^b_i - \beta_w \bigr) \notag\\
  &= 2 \bigl( -\sum_{i}^{N} w_i
      + \alpha_w \sum_{i}^{N} w^b_i
      + N\beta_w \bigr)
    \tag{8}
\end{align}
$$
Where $||w-\beta_w||_1$ represents the $l_1$-norm of $(w-\beta_w)$. Setting these derivatives to zero yields the optimal $\alpha_w^*$ and $\beta_w^*$:
$$
\begin{align}
\alpha_w^* &= \frac{\|w-\beta_w^*\|_1}{N}\tag{9}\\
\beta_w^* &= \frac{1}{N}\sum_i^N(w_i-\alpha_w^*\cdot Sign(w_i-\beta_w^*))\tag{10}
\end{align}
$$
The analytical solutions of $\alpha_w^*$ and $\beta_w^*$ cannot be obtained directly. Prior works [XNOR-Net, DSQ, BiPer] have proved that the weights of trained BNNs approximately follow symmetric Gaussian or Laplace distributions. For symmetric distributions, median approximates the mean, making the sum of signs approach zero. Thus we introduce the hypothesis $Median(w)\simeq\frac{1}{N}\sum_i^Nw_i$ and let $\beta_w^*=Median(w)$, then we have $\sum_i^N Sign(w_i-\beta_w^*)\simeq 0$, substituting into $(10)$ and the hypothesis can be satisfied:
$$
\beta_w^* = \frac{1}{N}\sum_i^N(w_i-\alpha_w^*\cdot Sign(w_i-\beta_w^*))\simeq \frac{1}{N}\sum_i^Nw_i\tag{11}
$$
Therefore, the bias and scaling factor of weight binarization with minimum quantization error can be expressed as:
$$
\begin{align}
\beta_w =& \frac{1}{N}\sum_i^Nw_i = \bar{w}\tag{12}\\
\alpha_w =& \frac{||w-\bar{w}||_1}{N}\tag{13}
\end{align}
$$
Only simple channel statistics (mean and $L_1$-norm) are needed, with negligible extra cost.

**Activation Binarization.** 

In contrast to weights, activations exhibit more dynamic distributions and much larger dimensionality. Performing per‑forward‑pass statistics on activations, like INSTA‑BNN[19], and solving analytically for $\alpha_a$ and $\beta_a$ incurs non-negligible computational overhead. To this end, we continue the idea of AdaBin[18], set $\alpha_a$ and $\beta_a$ as learnable parameters, allowing the binary activations to better adapt to the input distribution through backpropagation.

Furthermore, due to the per-channel computational nature of depthwise convolution[7], $\alpha_a$ and $\beta_a$ can be expanded to channel-wise during adaptive binarization, which significantly enhances the expressiveness and flexibility. 

### ABConv: From XNOR to NAND

**XNOR-based Convolution. ** To replace expensive floating‑point multiplication and accumulation (MAC) operations with efficient bit‑level operations, conventional BNNs primarily employ XNOR-BitCount linear operation. Leveraging our Optimized Adaptive Binarization, activations $a$ and weights $w$ are binarized via $\mathcal{B}(\cdot)$ with factors $\alpha_a,\beta_a,\alpha_w,\beta_w$ to minimize quantization error. For one output channel, XNOR‑BitCount convolution is
$$
\begin{aligned}
&\operatorname{ABConv-XNOR}\left(a,w\right) \\
&=\operatorname{Conv}\left(\alpha_a  \mathcal{B}(a)+\beta_a, \alpha_w \mathcal{B}(w)+\beta_w \right)\\
&=\alpha_a \alpha_w\left(\mathcal{B}(a) \bigotimes_{\text{XNOR}} \mathcal{B}(w)\right)+ \alpha_a \beta_w  \left(\mathcal{B}(a) \bigoplus I_w\right)+F_{\text{XNOR}}(w)\\
&F_{\text{XNOR}}(w)=\alpha_w \beta_a \sum \mathcal{B}(w)+\beta_a \beta_w N\\
\end{aligned}\tag{14}
$$
Where $\bigoplus$ represents the summation of the all‑ones mask $I_w$ over $\mathcal{B}(a)$ via BitCount. $F_{\text{XNOR}}(w)$ is a pre‑computable channel‑wise bias term. Note that XNOR‑BitCount implementations must map  $\mathcal{B}(a),\mathcal{B}(w)\in\{-1,+1\}$ to $\{0,1\}$ (via IEEE‑754 sign‑bit inversion), denoted as $a^B,w^B\in \{0,1\}$, to obtain a $\mathrm{Count}\in[0,N]$, then remap back to $[-N,N]$ by $(2\!\times\!\mathrm{Count}-N)$ and get the calibrated output.

**Binary-Operation Counts.** Let the activation tensor be of size $C_\text{in}\times H_\text{in}\times W_\text{in}$ and kernel size of $K_h\times K_w$; given stride, padding and groups $G$, output feature map has size $C_\text{out}\times H_\text{out}\times W_\text{out}$. The binary operations (BOPs) for standard binary convolution (BConv) and for ABConv are:
$$
\begin{aligned}&\text{BOPs}_{BConv}=C_{out}\frac{C_{in}}{G}  K_{h} K_{w} H_{out}W_{out}\\
&\text{BOPs}_{ABConv}=C_{out} \frac{C_{in}}{G}K_{h} K_{w} H_{out}W_{out}+C_{in} K_{h} K_{w} H_{out}W_{out}\end{aligned}\tag{15}
$$
**NAND-based Convolution.** Although XNOR is a commonly used efficient operation in BNN, but NAND logic gate only requires 4 transistors compared to the 10 transistors required for XNOR. Therefore, if the XNOR operation in ABConv can be replaced with NAND operation, the transistor overhead in CMOS circuit can be theoretically reduced by $2.5 \times$​ under the same conditions, improving efficiency of hardware implementation. However, replacing XNOR to NAND operations results in an increase of operations and parameters in BConv:
$$
\begin{align}BConv(a,w)&=\beta_c\left(\mathcal{B}(a) \bigotimes_{\text{XNOR}} \mathcal{B}(w)\right)\\&=\beta_c\left(-\left(a^B \bigotimes_{\text{NAND}} w^B\right)+\left(a^B \bigoplus I_w\right)+\sum w^B\right)\end{align}\tag{16}
$$
By contrast, our ABConv‑NAND absorbs scaling, bias, and the inverse‑remapping into the input transformation:
$$
\begin{aligned}
&\operatorname{ABConv-NAND}\left(a,w\right) \\
&=\operatorname{Conv}\left(2\alpha_a  a^B+(\beta_a-\alpha_a) , 2\alpha_w w^B+(\beta_w -\alpha_w)\right)\\
&=-4\alpha_a \alpha_w\left(a^B \bigotimes_{\text{NAND}} w^B\right)+ 2\alpha_a (\beta_w-\alpha_w)  \left(a^B \bigoplus I_w\right)+F_{\text{NAND}}(w)\\
&F_{\text{NAND}}(w)=2\alpha_w( \beta_a -\alpha_a)\sum w^B+(\beta_a-\alpha_a) (\beta_w\alpha_w)  N\\
\end{aligned}\tag{17}
$$
Here, $F_{\mathrm{NAND}}(w)$ is once again a pre‑computable bias term. No new parameters or bit‑level operations are added beyond the ABConv baseline, and the $(2\times\!\mathrm{Count}-N)$ remapping step vanishes—enabling a seamless swap of 10‑transistor XNOR units for 4‑transistor NAND gates on the ASIC/FPGA platform.

### Exponential Straight Through Estimator

While XNOR‑BitCount operation enables efficient forward inference, the non-differentiability of sign function introduces a severe inconsistency between the forward binarization and backward gradient flow. Prior STE variants [15,21-23] have attempted to address this issue, but each comes with multiple hyperparameters or multi-piecewise branches. To achieve a simpler, continuous approximation with a single dynamic parameter, we propose the Exponential Straight Through Estimator (ExSTE):
$$
\begin{aligned}
F_{ExSTE}(x,o)&=Sign(x)\cdot \frac{1-e^{-o\cdot|x|}}{1-e^{-o}}\\
\frac{\partial F_{ExSTE}(x,o)}{\partial x}&=\frac{oe^{-o\cdot|x|}}{1-e^{-o}}\cdot\mathbf{1}_{|x|\le1.5}\\
\end{aligned}\tag{18-19}
$$
During training, the temperature parameter $o$ is gradually increased using a cosine-shaped exponential schedule as $o=10^{\frac{\text{t}}{T}\cdot2.8-2}$, where $t$ the current training epoch and $T$ the total number of epochs. To avoid gradient explosion, gradients are clipped by applying the indicator function $\mathbf{1}_{|x|\le1.5}$. We distilled the formulation of ExSTE from both theoretical and practical considerations, enforcing that an ideal STE should satisfy the following properties:

**Symmetric:** Odd‑symmetric; passes through (0, 0), (1, 1) and (‑1, ‑1), matching the sign function's discrete outputs.

**Flexible:**  Controlled by a single parameter $o$, smoothly deforming from identity function $y = x$ to the hard sign function.

**Monotonic:** For any fixed $x\in[-1.5,1.5]$,  the output $F_{\text{ExSTE}}(x, o)$ moves closer to $\text{Sign}(x)$ as $o$ increases.

**Phasic:** The gradient distribution adapts over training, broad and exploratory near $\pm1$ in early phases, gradually concentrating around $x = 0$ in later fine-tuning.

**Simple:** Minimal complexity. ExSTE uses only exponential and multiplication operations with a single clipping condition at $|x| = 1.5$, avoiding piecewise or multi-branch logic.

<img src="C:\Users\a8789\OneDrive\文档\STE.svg" alt="STE" style="zoom: 50%;" />

*Figure 2. ExSTE function $F_{\text{ExSTE}}(x,o)$ and its derivative $\partial F_{\text{ExSTE}}(x,o)/\partial x$ at different training stages.*

As illustrated in Fig. 2, ExSTE gradually transitions from identity function into a sharp sign-like function as training progresses. Correspondingly, the gradient distribution shifts from broadly distributed around $x\in [-1.5,1.5]$ to narrowly concentrated near zero. This dynamic behavior aligns well with Adaptive Binarization, which normalizes activations and weights before applying the $\text{Sign}(\cdot)$ operation, resulting a wider distributions within estimator than standard binarization methods. The monotonic and phasic properties of ExSTE make it particularly well-suited to such distributions, promoting stable and effective gradient flow. Our ablation studies further confirms that ExSTE consistently outperforms existing state-of-the-art STE variants when applied within ABConv layers.

### BEANet Architecture Design

<img src="C:\Users\a8789\OneDrive\文档\BNNs-compare.svg" alt="BNNs-compare" style="zoom: 80%;" />

*Figure 3. Modern Binary convolution processor comparison among MeliusNet[26], PokeBNN[27], BNext[24] and our Efficient ACE processor, where "SE" stands for Squeeze-and-Expand[11] module and "BN" denotes batch normalization[57].*

BNNs have two primary bottlenecks under 1‑bit quantization: capacity degradation and optimization difficulty. Despite amount of optimization work [18-23] has been done on binarization and STE ,the inherent quantization error from binarization and the approximation error from STE still cause training instability and accuracy loss. Therefore, optimization of network structure is also crucial to model performance. 

Our BEANet is driven by two core motivations: 1) Multi‑level feature reuse to enhance representational capacity, and 2) Multi‑path residual connections to strengthen gradient flow during optimization. In the following section, we detail key component and overall structure of BEANet. 

**Adaptive Channel Enhancement (ACE) Processor.** ACE Processor  is the core component of BEANet, enhance the representational capacity of 1-bit data. It is implemented in two variants: **Efficient** and **Performance**.

As illustrated in Fig. 3 and Fig. 4, the Efficient ACE Processor first employs a $7\times7$ kernel size depthwise ABConv (DWABConv). The output flows into an enhancement branch that first concatenates with original input, followed by $1\times1$ pointwise ABConv to compress the expanded tensor to input width, after which the branch output is element-wise added to the DWABConv path. Finally, a full-precision Squeeze-and-Expand (SE) 11 module adaptively recalibrates the output channels.

Compared to MeliusNet[26], Efficient ACE processor utilizes lighter depthwise convolution while preserving channel consistency. Compared to PokeBNN [27] and BNext [24], it adopts DenseNet-style concatenation for feature reuse, effectively enriching the feature representation.

To further enhance the representation and discrimination, the Performance ACE Processor modifies the Efficient design, as shown in the red part of Fig. 4, by replacing the $7\times7$ DWABConv with a standard $3 \times 3$ ABConv and replacing the SE module to a channelwise scaling factor $\gamma$ for recalibration. As shown in the ablation study, this streamlined approach achieves higher accuracy while reducing both parameter and OPs.

**Basic Block Design with Attention and Feed-Forward Network structure.** 

<img src="C:\Users\a8789\OneDrive\文档\BEAN-ALL.svg" alt="BEAN-ALL" style="zoom: 67%;" />

*Figure 4. The architecture of BEANet. The Efficient and Performance ACE processor are the basic adaptive channel enhancement binary convolution modules with different computational densities, used in the Attention and FFN stages of the BEAN block respectively. The dashed part in BEANet Block only used in the first block of each Stage to increase receptive field and expand channel . "C" indicates the starting channel width of network, and $(N_1,N_2,N_3,N_4)$represents the number of the bocks in each stage.*

Vision Transformer models such as Swin Transformer [10] expand the receptive field via shifted window self-attention combined with feed-forward-network (FFN). Similarly, ConvNeXt [4,5] achieves a comparable effect  through a large kernel size depthwise convolutions followed by pointwise convolution. Inspired by this architectural paradigm, our BEANet block couples Efficient and Performance ACE processor to form a binary neural network counterpart of the classic “Attention + FFN” design, as shown in Fig. 4. 

In the Attention step, an Efficient ACE Processor captures wide‑receptive‑field information, followed by an element‑wise multiplication bypass that similarly to self-attention by adaptively modulating the feature map before the residual connection. In the FFN step, a Performance ACE Processor delivers high‑density binary convolution to enhance feature mixing. Inspired by ReActNet[14], unlike most CNNs that downsample via convolution or pooling layer at stage boundaries, BEANet places the pooling layer mid-block and increases the channel dimension by concatenating multiple processor outputs. 

<img src="C:\Users\a8789\OneDrive\文档\DPReLU.svg" alt="DPReLU" style="zoom: 33%;" />

*Figure 5. Comparison of the flexibility of ReLU-like activation functions [42,43,46].*

Due to the intrinsic nonlinearity of binarized activations, activation function design is critical for BNNs. Previous works [14, 18, 27] has demonstrated that flexible ReLU[46]-like function improve BNNs performance. PReLU[14] is widely used in BNNs for its stability and efficiency, other strategies such as Maxout[43] and DPReLU[42] offer more expressive control control with higher cost and risk of instability. We compare the flexibility of ReLU-like activation functions in Fig. 5. BEANet adopts a hybrid strategy: DPReLU is used only in element-wise multiplication bypass, where fine-grained control is most beneficial, and processors apply PReLU for training robustness. As demonstrated in the ablation study, this hybrid approach strikes the optimal balance between accuracy and efficiency.

**BEANet Architecture Overview and family details.** 

As depicted in Fig. 4, BEANet begins with a full precision $4\times4$ stride-4 Convolution + BN + ReLU stem to effectively patchifies the input image. BEANet then progresses through four stages of BEAN blocks, each gradually increasing the channel width and reducing spatial resolution through downsampling at a designated block. After the final stage, global average pooling and LayerNorm are applied to consolidate features before the classification head.

***Table I. Configuration of BEANet family.***

| Models        | Stage blocks ($N_1,N_2,N_3,N_4$) | Base Width(C) | Params(MB) |
| ------------- | :------------------------------: | :-----------: | :--------: |
| BEANet-nano   |          2 , 2 , 6 , 2           |      32       |    4.09    |
| BEANet-tiny   |          3 , 3 , 9 , 3           |      32       |    5.44    |
| BEANet-small  |          2 , 2 , 6 , 2           |      48       |    7.53    |
| BEANet-middle |          3 , 3 , 9 , 3           |      48       |   10.54    |
| BEANet-large  |          3 , 3 , 9 , 3           |      64       |   17.00    |

Table I summarizes the configurations of the BEANet family. The tuple ($N_1,N_2,N_3,N_4$) represents the number of BEAN blocks in each of the four stages. Five BEANet variants—nano, tiny, small, middle, large—are defined by varying the number of blocks per stage and the base channel width. These variants scale from 4 MB to 17 MB to suit diverse compute and storage constraints. 

 ### Multi-Teacher Hard Knowledge Distillation.

Knowledge Distillation (KD) [9] has become a crucial optimization for BNNs [14,24,27,29], enabling the transfer of supervisory signals from pretrained high‑precision teacher to compact binary student model. However, prior research [54-56] has shown that when teacher and student differ significantly in capacity or architecture, output distribution from teacher may mislead student rather than help it. To address this, we propose Multi‑Teacher Hard Knowledge Distillation, which leverages both a **main teacher** whose architecture closely matches the student and a pool of **assistant teachers** of varying complexity, and a **ground-truth (GT) correction mechanism** that adaptively adjusts the learning signal based on prediction agreement.

We begin by selecting a main teacher whose structure is similar to the student. The student is trained using a combination of two losses: the Kullback–Leibler (KL) divergence between the output distributions of main teacher and student; the cross‑entropy loss between student output and ground‑truth label $y$. To address potential teacher mispredictions, we define a binary mask $\mathbf{1}_{[\hat{y}_{T_{m}}(x)\neq y]}$ based on whether the prediction of main teacher  $\hat y_{T_{\mathrm{m}}}(x)$ matches ground-truth. This mask interpolates between the KL and CE losses with a  coefficient $\alpha\in[0,1]$, leading to the following loss:
$$
\mathcal{L}_{\mathrm{main}}(x) = \bigl(1 - \alpha \cdot \mathbf{1}_{[\hat{y}_{T_{m}}(x) \neq y]}\bigr)\mathrm{KL}\!\bigl(p_{T_{m}}(x) \,\|\, p_S(x)\bigr) + \alpha \cdot \mathbf{1}_{[\hat{y}_{T_{m}}(x) \neq y]} \mathrm{CE}\bigl(p_S(x), y\bigr)\tag{20}
$$
Here,  $p_{T_{\mathrm{m}}}(x)$ and $p_S(x)$ denote the output distributions from main teacher and student, respectively. The  $\alpha$ is annealing from 1 to 0 over training encourages early reliance on ground-truth supervision and a gradual shift toward soft targets.

To further diversify the supervision, we maintain $N$ **assistant teachers** $\{T_{\mathrm{assist}_k}\}_{k=1}^N$ vary in depth and structure. To avoid noisy or conflicting signals, we apply a shifted window selection mechanism over epochs. At training epoch $t$ (out of total epochs $T$), we pick a window of size $M$ among assistant teachers starting from index $\lceil\frac{\text{t}N}{T}\rceil$. The KL divergence from these teachers is averaged to form the assistant loss:
$$
\mathcal{L}_{\mathrm{assist}}(x) \;=\; \frac{1}{M}\;\sum_{k=\lceil\frac{\text{t}N}{T}\rceil}^{\lceil\frac{\text{t}N}{T}\rceil+M-1}\; \mathrm{KL}\Bigl(p_{T_{\mathrm{assist}_k}}(x) \,\Big\|\, p_S(x)\Bigr)\tag{21}
$$
This dynamic schedule ensures the student is exposed to a variety of perspectives throughout training. The total distillation loss is a weighted sum of the main and assistant losses:
$$
\mathcal{L}(x) \;=\; \beta\;\mathcal{L}_{\mathrm{main}}(x) \;+\; \bigl(1-\beta\bigr)\;\mathcal{L}_{\mathrm{assist}}(x)\tag{22}
$$
$\beta$ is a hyperparameter that balances the proportion of main teacher information and multiple assistant teacher knowledge. In practice, we set $\beta$ to 0.6 to balance stability and diversity. 

## Experiments

In this section, we evaluate our proposed BEANet model and training methods on the ILSVRC12 ImageNet[44] and the CIFAR-10[45] dataset. We also conduct ablation studies to analyze the effectiveness of each of the above components.

### Experiment Setup

We employ the AdamW[37] optimizer with $\beta=(0.99,0.999)$, and weight decay of $10^{-4}$ for most parameters, except for the binarization factors of $10^{-8}$. The learning rate is initialized at $10^{-3}$ , warmed up for first 3 epochs and then gradually decreased to $10^{-8}$ via Cosine Annealing Scheduler [38]. We implement the proposed method using PyTorch [60], and the models are trained on 4 Nvidia RTX 4090 GPUs.

**ImageNet:**  For training stage, images are randomly resized and cropped to 224×224 with batch size of 256 for 512 epochs, augmented with random horizontal flipping, and RandAugment[39] using 2 augmentation operations, where the magnitude is set to 5 for BEANet-tiny, 7 for BEANet-small, and 9 for BEANet-middle/BEANet-large, followed by normalization using the standard ImageNet mean and standard deviation. For evaluation, images are resized such that the shorter side is scaled to approximately 256 pixels and then center-cropped to 224×224, ensuring consistency during inference. We use ConvNextV2[5]-Tiny as the main teacher for proposed Multi-Teacher Hard Knowledge Distillation, and {ConvNextV2-fetmo , LeViT[40]-192} as the assistant teachers for BEANet-tiny/small,  and {ConvNextV2-fetmo , LeViT-192 , ConvNextV2- nano , TinyViT[41]-11m} for BEANet-middle/large, with a shifted window size $M=2$, and hyperparameters $\alpha$ reduced from 1 to 0 via Cosine Annealing and $\beta=0.6$.

**CIFAR-10:** We evaluate BEANet using ResNet-18/20 backbone with batch size of 512 for 512 epoch. For fair comparison, we adopt the double skip connection[15] and the downsampling layers are not binarized. We use the standard augmentations random crop , random horizontal and normalization, and adopt cross entropy [60] as loss function for optimization.

### Performance Evaluation

**ImageNet.**

***Table II. ImageNet classification results of state‑of‑the‑art BNNs, grouped by parameter scale. BEANet achieves the highest Top‑1 accuracy in every group while maintaining competitive or lower computational cost.***

| Scale      | Model             | Params (MB) | BOPs (G)  | FLOPs (10^8^) | OPs (10^8^) | Top‑1(%) |
| ---------- | ----------------- | ----------- | --------- | ------------- | ----------- | -------- |
| **Nano**   | XNOR‑Net [13]     | 4.2         | 1.70      | 1.20          | 1.47        | 51.2     |
|            | Bi‑Real‑18 [15]   | 4.2         | 1.68      | 1.39          | 1.65        | 56.4     |
|            | RAD-BNN-18 [33]   | 4.3         | 1.68      | 1.48          | 1.74        | 65.6     |
|            | AdaBin‑18 [18]    | 4.35        | 1.68      | 1.43          | 1.70        | 66.4     |
|            | ReCU‑18 [35]      | 4.25        | 1.68      | 1.40          | 1.67        | 66.4     |
|            | **BEANet‑nano**   | **4.09**    | **1.82**  | **0.05**      | **0.34**    | **66.8** |
| **Tiny**   | Bi-Real-34 [15]   | 5.1         | 3.53      | 1.39          | 1.94        | 62.2     |
|            | ReCU-34 [35]      | 5.1         | 3.53      | 1.39          | 1.94        | 65.1     |
|            | Real2Binary [29]  | 5.1         | 1.67      | 1.56          | 1.82        | 65.4     |
|            | APD-BNN-34 [32]   | 5.4         | 3.53      | 1.39          | 1.94        | 66.8     |
|            | RAD-BNN-34 [33]   | 5.4         | 3.53      | 1.55          | 2.10        | 68.2     |
|            | BNext-18 [24]     | 5.4         | 1.68      | 1.28          | 1.64        | 68.4     |
|            | **BEANet‑tiny**   | **5.4**     | **2.87**  | **0.05**      | **0.51**    | **70.5** |
| **Small**  | ReActNet‑A [14]   | 7.4         | 4.82      | 0.12          | 0.87        | 69.4     |
|            | AdaBin-A [18]     | 7.9         | 4.87      | 0.12          | 0.88        | 70.4     |
|            | APD‑BNN‑A [32]    | 7.4         | 4.82      | 0.12          | 0.87        | 72.0     |
|            | INSTA-BNN+ [19]   | 8.9         | 4.82      | 0.20          | 0.96        | 72.2     |
|            | **BEANet-small**  | **7.53**    | 4.00      | 0.08          | 0.71        | **72.4** |
| **Medium** | BNext‑T [24]      | 13.3        | 4.82      | 0.13          | 0.89        | 72.4     |
|            | **BEANet‑medium** | **10.5**    | **6.33**  | **0.09**      | **1.08**    | **74.6** |
| **Large**  | MeliusNet‑59 [26] | 17.4        | 18.30     | 2.45          | 5.32        | 71.0     |
|            | AdaBin‑59 [18]    | 17.4        | 18.44     | 2.45          | 5.34        | 71.6     |
|            | BNext‑S [24]      | 26.7        | 10.84     | 0.21          | 1.90        | 76.1     |
|            | **BEANet‑large**  | **17.0**    | **11.15** | **0.12**      | **1.86**    | **77.1** |

As illustrated in Table II, our expanded ImageNet evaluation demonstrates that BEANet decisively advances the state-of-the-art BNNs across the entire 4 – 26 MB parameter spectrum.  We benchmarked against all landmark baselines: XNOR‑Net[13], Bi‑RealNet[15], Real2BinaryNet[29], ReActNet[14], AdaBin[18],  MeliusNet[26], ReCU[35], APD-BNN[32], INSTA-BNN[19], RAD-BNN[33] and the high‑capacity BNext[24] series, covering the compute operations (OPs) from $0.34×10^8$ to $5.32×10^8$ and model sizes from 4 MB to 26 MB. We group all models based on the scale of parameters, namely nano (<5MB), tiny (5-7MB), medium (7-15MB), and large (15-30MB). All reference values/figures were taken directly from the original publications or re‑implementations to ensure fairness. Hybrid‑quantization models such as PokeBNN[27] and the post‑training quantized editions of BNext[24] are excluded because they rely on per‑layer bit‑width tuning and heterogeneous hardware support, making direct ranking with purely binary networks inequitable under identical resource assumptions.

Within this unified benchmark, our BEANet family pushes the accuracy–efficiency frontier at every scale of BNNs: BEAN‑nano, the lightest model in the table, achieves 66.8 % Top‑1 accuracy with 4.09 MB parameters, surpassing all other ≤ 5 MB BNNs, while requiring only one-fifth the OPs. BEAN‑large delivers a record 77.1 % Top‑1 with only 17 MB parameters and $1.86×10^8$ OPs, eclipsing the BNext‑S, AdaBin‑59, and MeliusNet‑59. Two consistent observations emerge across all scales: (1) Compute‑efficiency—BEANet variants maintain FLOPs below 0.12 × 10⁸, an order of magnitude lower than methods relying full‑precision shortcut; (2) Parameter‑efficiency—the adaptive binarization strategy and model architecture design lead to higher accuracy per byte, allowing BEAN‑medium to rival models with 30% more parameters and BEAN‑large to outperform networks that are 50% larger.  

**CIFAR-10.**

***Table III. A comparison of the state‑of‑the‑art BNNs on CIFAR-10 with ResNet-18 and  ResNet-20 backbone. "W/A" indicates the weight and activation bit-width of convolution except for the stem layer.***

| **Backbone**  | **Method**       | **W/A** | **Top-1(%)** |
| ------------- | ---------------- | ------- | ------------ |
| **ResNet-18** | Baseline [3]     | 32/32   | 94.8         |
|               | RAD-BNN[33]      | 1/1     | 90.5         |
|               | IR-Net[22]       | 1/1     | 91.5         |
|               | RBNN[21]         | 1/1     | 92.2         |
|               | ReSTE [23]       | 1/1     | 92.63        |
|               | ReCU [35]        | 1/1     | 92.8         |
|               | AdaBin [18]      | 1/1     | 93.1         |
|               | BNext18 [24]     | 1/1     | 93.6         |
|               | BiPer [31]       | 1/1     | 93.75        |
|               | **BEAN18(ours)** | 1/1     | **93.80**    |
| **ResNet-20** | Baseline [3]     | 32/32   | 92.1         |
|               | DSQ [20]         | 1/1     | 84.1         |
|               | IR-Net [22]      | 1/1     | 86.5         |
|               | ReCU [35]        | 1/1     | 87.4         |
|               | BiPer [31]       | 1/1     | 87.5         |
|               | AdaBin [18]      | 1/1     | 88.2         |
|               | **BEAN20(ours)** | 1/1     | **88.52**    |

We further explore the generalization of BEANet on the smaller dataset CIFAR-10 (Table III). We implement BEANet with ResNet-18 and ResNet-20 backbones and compare with the latest state-of-the-art BNNs. BEANet attains the highest Top-1 accuracy, demonstrating superior robustness on CIFAR-10 relative to existing BNN designs. 

### Ablation Study

**STE Function.**

To clearly demonstrate the impact of different STE variants, we build simplified binary models based on ResNet [3] architectures by replacing their convolution and nonlinear activation layers with ABConv and PReLU, respectively. Specifically, we employ ResNet-18 and ResNet-20 as backbones, trained from scratch on the CIFAR-10 dataset. Models are trained under minimal data augmentation for only 128 epochs, intentionally ensuring slight underfitting. This setup isolates the influences of overfitting or intensive regularization, providing a fair comparison of STEs.

***Table IV. Results of the SOTA estimators comparison. “Clip Range” indicates the input interval over which the estimator derivative is non-zero, and ResNet-18/20 columns report validation top-1 accuracy.***

| Method        | Derivative Formula                                           |               Clip Range               | ResNet18  | ResNet20  |
| ------------- | ------------------------------------------------------------ | :------------------------------------: | :-------: | :-------: |
| STE[16]       | $1$                                                          |               $[-1.5,1]$               |   89.85   |   83.36   |
| Piecewise[15] | $2-2|x|$                                                     |                $[-1,1]$                |   85.81   |   74.62   |
| EDE[22]       | $max(o,1) \left(1-tanh^2(ox)\right)$                         |              $[-1.5,1.5]$              |   89.35   |   83.64   |
| RBNN[21]      | $max(o,1)(\sqrt{2}-|ox|)$                                    | $[-\frac{\sqrt2}{o},\frac{\sqrt2}{o}]$ |   56.89   |   51.53   |
| ReSTE[23]     | $\left\{\begin{aligned} &\frac{1}{o}\cdot|x|^{\frac{1}{o} -1}&&, |x|\geq0.1\\& 0.1^{\frac{1}{o} -1} &&,|x|<0.1\end{aligned}\right.$ |              $[-1.5,1.5]$              |   89.56   |   83.77   |
| ExSTE (ours)  | $\frac{oe^{-o\cdot|x|}}{1-e^{-o}}$                           |              $[-1.5,1.5]$              | **90.37** | **84.04** |

Table IV presents a comprehensive comparison of ExSTE with state-of-the-art STE variants. ExSTE consistently achieves superior validation accuracy compared to other estimators under identical experimental conditions. These results confirm that the properties are of ExSTE particularly suitable for adaptive binarization, significantly improving training stability and accuracy.

**Module Design.**

***Table V. Ablation study of BEANet components on ImageNet. Resulting the relative differences in operations (Ops), parameters, training and validation Top‑1 accuracy compared to the BEANet-nano baseline.***

| Method       | Δ OPs ($10^7$) | Δ Params (MB) | Δ Train Top‑1 (%) | Δ Val Top‑1 (%) |
| ------------ | -------------- | ------------- | ----------------- | --------------- |
| **Baseline** | **3.39**       | **4.065**     | **59.18**         | **63.96**       |
| BConv        | −0.10          | −0.05         | −2.62             | −2.23           |
| Pre-norm     | –              | –             | −0.72             | −0.64           |
| all DPReLU   | –              | +0.15         | −0.10             | −0.29           |
| all PReLU    | –              | −0.013        | −0.79             | −0.36           |
| Pre-Pool     | −0.10          | –             | −0.72             | −0.57           |
| Binary SE    | −0.03          | −0.89         | −2.67             | −2.18           |
| w/o SE       | −0.04          | −1.01         | −2.24             | −1.76           |
| SPR module   | +0.04          | +0.33         | −0.28             | −0.87           |
| Post-SE      | +0.01          | +0.13         | −0.14             | −0.05           |

To examine the internal design of the BEANet and related components, we perform extensive ablation studies on BEANet-nano trained for 80 epochs on ImageNet under standard configuration. As shown in Table V, replacing ABConv with binary convolution (BConv) [13] degrades Top-1 accuracy by 2.23% while providing negligible parameter savings. Additionally, since several works [13,26,29] place BN layer before BConv, we validate that pre-norm design (BN→ABConv→PReLU) on BEANet, and the results indicate that our default design (ABConv→BN→PReLU) provides higher overall stability. Simply replacing all activation layers with PReLU or DPReLU results in accuracy drop compared to our hybrid strategy, and same trend holds for downsampling strategies: relocating pooling layer to the beginning of BEANet block (Pre-Pool) results in slightly lower computational cost but significantly lower accuracy than the default mid-block pooling. 

Finally, we conduct ablations on the SE layer. Adopting ABConv version of SE (Binary SE) leads to a significant drop in accuracy, even worse than simply replacing SE with a channelwise parameter $\gamma$ (w/o SE). Otherwise, using a more complex SE-like Spatial Pyramid Recalibration (SPR) [58] module brings additional computational cost and parameters but degrading performance, exchanging the channel recalibration strategy of the Efficient and Performance ACE processors (post-SE) introduces a similar outcome. This indicates that the SE layer is well adapted to BEANet for channel recalibration, especially for the Efficient ACE processor, compensating the lack of channel re-fusion in depthwise ABConv.

**Optimization Scheme.** 

***Table VI. Ablation study of different optimization schemes based on BEANet-nano on ImageNet dataset.***

| Step                           | Epochs | Train Top‑1 (%) | Val Top‑1 (%) |
| ------------------------------ | ------ | --------------- | ------------- |
| CE loss                        | 80     | 59.10           | 62.19         |
| + Knowledge Distillation (KD)  | 80     | 58.84           | 63.44         |
| + Ground‑truth correction (GT) | 80     | 58.90           | 63.58         |
| + Cosine Annealing GT weight   | 80     | 59.18           | 63.96         |
| + Long Training                | 512    | **62.91**       | **66.83**     |

Similar to the module design ablation study, we verify the effects of various optimization schemes on the Top-1 accuracy under the BEANet-nano setup, as summarized in Table VI. Starting with the baseline cross-entropy (CE) loss, using multi-teacher knowledge distillation without ground truth (KD, $\alpha=0$) moderately increases validation accuracy by +1.25%, despite a slight drop in training accuracy; enabling constant ground truth correction ($\alpha=1$) improves validation accuracy by 0.14%; switching to a cosine annealing schedule for $\alpha$  further improves validation accuracy by 0.38%; and extending training epochs to 512 leads to a substantial improvement for both training and validation accuracy by about 3%. These cumulative improvements confirm the effectiveness of each optimization scheme for enhancing BEANet performance.

## Conclusion

This paper introduced BEANet, a binary neural network framework that establishes new state-of-the-art Top-1 accuracy on the ImageNet dataset across all evaluated model scales. This significant performance leap is achieved through a synergistic integration of key innovations: an optimized adaptive binarization method that effectively minimizes quantization error; a novel exponential straight-through estimator (ExSTE) uniquely tailored for stable training with adaptive binarization; and the distinctive BEANet architecture, which leverages an Adaptive Channel Enhancement processor for potent feature representation. Furthermore, our proposed Multi-Teacher Hard Knowledge Distillation strategy plays a crucial role in reducing overfitting and enhancing generalization capabilities. Consequently, experimental results on ImageNet not only highlight BEANet's superior accuracy but also demonstrate its prowess as a powerful feature extractor for image representation learning, excelling in both parameter-efficiency and compute-efficiency. These advancements pave the way for the practical deployment of highly accurate BNNs in diverse real-world applications and encourage further exploration into the co-design of next-generation binary-friendly architectures.

## Reference

[1] J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding," in *Proc. NAACL-HLT*, 2019, pp. 4171–4186.
[2] A. Radford, K. Narasimhan, T. Salimans, and I. Sutskever, "Improving Language Understanding by Generative Pre-Training," OpenAI, 2018. [Online]. 
[3] K. He, X. Zhang, S. Ren, and J. Sun, "Deep Residual Learning for Image Recognition," in *Proc. CVPR*, 2016, pp. 770–778.
[4] Z. Liu, H. Mao, C.-Y. Wu, C. Feichtenhofer, T. Darrell, and S. Xie, "A ConvNet for the 2020s," in *Proc. CVPR*, 2022, pp. 11976–11986.
[5] S. Woo, S. Debnath, R. Hu, X. Chen, Z. Liu, I. S. Kweon, and S. Xie, "ConvNeXt V2: Co-designing and Scaling ConvNets with Masked Autoencoders," in *Proc. CVPR*, 2023, pp. 10306–10315.
[6] A. Dosovitskiy, L. Beyer, A. Kolesnikov, D. Weissenborn, X. Zhai, T. Unterthiner, M. Dehghani, M. Minderer, G. Heigold, S. Gelly, J. Uszkoreit, and N. Houlsby, "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale," in *Proc. ICLR*, 2021.
[7] A. G. Howard, M. Zhu, B. Chen, D. Kalenichenko, W. Wang, T. Weyand, M. Andreetto, and H. Adam, "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications," arXiv preprint arXiv:1704.04861, 2017.
[8] X. Zhang, X. Zhou, M. Lin, and J. Sun, "ShuffleNet: An Extremely Efficient Convolutional Neural Network for Mobile Devices," in *Proc. CVPR*, 2018, pp. 6848–6856.
[9] G. Hinton, O. Vinyals, and J. Dean, “Distilling the knowledge in a neural network,” *Proceedings of the NeurIPS Deep Learning and Representation Learning Workshop*, 2015.
[10] Z. Liu, Y. Lin, Y. Cao, H. Hu, Y. Wei, Z. Zhang, S. Lin, and B. Guo, "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows," in *Proc. ICCV*, 2021, pp. 10012–10022.
[11] J. Hu, L. Shen, S. Albanie, G. Sun, and E. Wu, "Squeeze-and-Excitation Networks," in *Proc. CVPR*, 2018, pp. 7132–7141.
[12] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, "Attention Is All You Need," in *Proc. NeurIPS*, 2017, pp. 5998–6008.
[13] M. Rastegari, V. Ordonez, J. Redmon, and A. Farhadi, "XNOR-Net: ImageNet Classification Using Binary Convolutional Neural Networks," in *Proc. ECCV*, 2016, pp. 525–542.
[14] Z. Liu, Z. Shen, M. Savvides, and K.-T. Cheng, "ReActNet: Towards Precise Binary Neural Network with Generalized Activation Functions," in *Proc. ECCV*, 2020, pp. 109–125.
[15] Z. Liu, B. Wu, W. Luo, X. Yang, W. Liu, and K.-T. Cheng, "Bi-Real Net: Enhancing the Performance of 1-bit CNNs With Improved Representational Capability and Advanced Training Algorithm," in *Proc. ECCV*, 2018, pp. 722–737.
[16] M. Courbariaux, Y. Bengio, and J.-P. David, “BinaryConnect: Training deep neural networks with binary weights during propagations,” *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 28, 2015, pp. 3123–3131.
[17] I. Hubara, M. Courbariaux, D. Soudry, R. El-Yaniv, and Y. Bengio, “Binarized neural networks: Training deep neural networks with weights and activations constrained to +1 or -1,” *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 29, 2016, pp. 4107–4115.
[18] Z. Tu, X. Chen, P. Ren, and Y. Wang, “AdaBin: Improving binary neural networks with adaptive binary sets,” *European Conference on Computer Vision (ECCV)*, 2022, pp. 1–17.
[19] C. Lee, H. Kim, E. Park, and J.-J. Kim, “INSTA-BNN: Binary neural network with INSTAnce-aware threshold,” *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2023, pp. 1–10.
[20] R. Gong, W. Liu, and Y. Yang, “Differentiable soft quantization: Bridging full-precision and low-bit neural networks,” *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2019, pp. 4851–4860.
[21] J. Zhang and Y. Liu, “RBNN: Memory-efficient reconfigurable deep binary neural network with IP protection for Internet of Things,” *IEEE Transactions on Computer-Aided Design of Integrated Circuits and Systems*, vol. 41, no. 6, pp. 1–10, 2022.
[22] H. Qin, R. Gong, X. Liu, M. Shen, Z. Wei, F. Yu, and J. Song, “Forward and backward information retention for accurate binary neural networks,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2020, pp. 2250–2259.
[23] X. Wu and Y. Zhang, “Estimator meets equilibrium perspective: A rectified straight through estimator for binary neural networks training,” *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2023, pp. 1–10.
[24] Y. Zhang and J. Yang, “Join the high accuracy club on ImageNet with a binary neural network ticket,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2022, pp. 1–10.
[25] J. Bethge and Y. Liu, “BinaryDenseNet: Developing an architecture for binary neural networks,” *Proceedings of the IEEE/CVF International Conference on Computer Vision Workshops (ICCVW)*, 2019, pp. 1–10.
[26] J. Bethge and Y. Liu, “MeliusNet: An improved network architecture for binary neural networks,” *Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)*, 2021, pp. 1–10.
[27] P. Xue and Z. Wei, “PokeBNN: A binary pursuit of lightweight accuracy,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 1–10.
[28] Y. Liu and Y. Liu, “Towards accurate binary convolutional neural network,” *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 31, 2017, pp. 1–10.
[29] B. Martinez, J. Yang, A. Bulat, and G. Tzimiropoulos, “Training binary neural networks with real-to-binary convolutions,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2020, pp. 1–10.
[30] J. Xue and Z. Wei, “Self-distribution binary neural networks,” *Applied Intelligence*, vol. 51, no. 1, pp. 1–10, 2021.
[31] Y. Zhang and Y. Liu, “BiPer: Binary neural networks using a periodic function,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 1–10.
[32] Y. Liu and Y. Liu, “Learn appropriate precise distributions for binary neural networks,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 1–10.
[33] H. Wang and Y. Zhang, “RAD-BNN: Regulating activation distribution for accurate binary neural network,” *European Conference on Computer Vision (ECCV)*, 2022, pp. 1–10.
[34] Huang G, Liu Z, Van Der Maaten L, Weinberger KQ, "Densely connected convolutional networks." *Proceedings of the IEEE conference on computer vision and pattern recognition*, 2017.
[35] Xu, Zihan, Mingbao Lin, Jianzhuang Liu, Jie Chen, Ling Shao, Yue Gao, Yonghong Tian, and Rongrong Ji. "Recu: Reviving the dead weights in binary neural networks." *In Proceedings of the IEEE/CVF international conference on computer vision*, pp. 5198-5208. 2021.
[36] A. A. Radosavovic, D. Xie, and S. M. Ali, “Learning student-friendly teacher networks for knowledge distillation,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 1–10.
[37] L. Loshchilov and F. Hutter, “Decoupled weight decay regularization,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2018.
[38] L. Loshchilov and F. Hutter, “SGDR: Stochastic gradient descent with warm restarts,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2017.
[39] E. Cubuk, B. Zoph, D. Mane, V. Vasudevan, and Q. Le, “RandAugment: Practical automated data augmentation with a reduced search space,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2020, pp. 1–10.
[40] C. Xu, H. Chen, and Z. Wang, “LeViT: A vision transformer in ConvNet’s clothing for faster inference,” *Proceedings of the NeurIPS Conference on Neural Information Processing Systems*, 2020, pp. 1–10.
[41] J. Chen, Z. Zhang, and Y. Yang, “TinyViT: Fast pretraining distillation for small vision transformers,” *Proceedings of the NeurIPS Conference on Neural Information Processing Systems*, 2021, pp. 1–10.
[42] J. Zhang and Y. Liu, “DPReLU: Dynamic parametric rectified linear unit and its proper weight initialization method,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2022, pp. 1–10.
[43] I. Goodfellow, D. Warde-Farley, M. Mirza, X. Chen, and Y. Bengio, “Maxout networks,” *Proceedings of the International Conference on Machine Learning (ICML)*, 2013, pp. 1–9.
[44] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and L. Fei-Fei, “ImageNet: A large-scale hierarchical image database,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2009, pp. 248–255.
[45] A. Krizhevsky, “Learning multiple layers of features from tiny images,” Technical Report, University of Toronto, 2009.
[46] A. Krizhevsky, I. Sutskever, and G. Hinton, “ImageNet classification with deep convolutional neural networks,” *Proceedings of the NeurIPS Conference on Neural Information Processing Systems*, 2012, pp. 1–9.
[47] M. Jacob, S. Kligys, B. Chen, M. Tang, Y. Wang, and H. Chen, “Quantization and training of neural networks for efficient integer-arithmetic-only inference,” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2018, pp. 1–10.
[48] N. Micikevicius, S. Narang, J. Alben, G. Diamos, D. Elsen, M. Garofalakis, M. Novikov, and P. Patwary, “Mixed precision training,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2018.
[49] S. Molchanov, D. Tsuchiya, and M. Yamada, “Channel pruning for accelerating very deep neural networks,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2017.
[50] S. Chen, X. Li, and Y. Wang, “Compressing neural networks with the hashing trick,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2016.
[51] S. Chen, X. Li, and Y. Wang, “Functional hashing for compressing neural networks,” *Proceedings of the International Conference on Learning Representations (ICLR)*, 2017.
[52] Paszke, Adam, Sam Gross, Soumith Chintala, Gregory Chanan, Edward Yang, Zachary DeVito, Zeming Lin, Alban Desmaison, Luca Antiga, and Adam Lerer. "Automatic differentiation in pytorch.", 2017.
[53] Ron Banner, Yury Nahshan, and Daniel Soudry, "Post training 4-bit quantization of convolutional networks for rapiddeployment". *Advances in Neural Information Processing Systems*, 2019.
[54] Stanton S, Izmailov P, Kirichenko P, Alemi AA, Wilson AG, "Does knowledge distillation really work?". *Advances in neural information processing systems*, 2021.
[55] Beyer, Lucas, Xiaohua Zhai, Amélie Royer, Larisa Markeeva, Rohan Anil, and Alexander Kolesnikov, "Knowledge distillation: A good teacher is patient and consistent." *In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition*, 2022.
[56] Park, Dae Young, Moon-Hyun Cha, Daesin Kim, and Bohyung Han, "Learning student-friendly teacher networks for knowledge distillation." *Advances in neural information processing systems*, 2021.
[57] Ioffe, Sergey, and Christian Szegedy. "Batch normalization: Accelerating deep network training by reducing internal covariate shift." *In International conference on machine learning*, 2015.
[58] Yu, Yang, Yi Zhang, Zeyu Cheng, Zhe Song, and Chengkai Tang. "Multi-scale spatial pyramid attention mechanism for image recognition: An effective approach." *Engineering Applications of Artificial Intelligence*, 2024.