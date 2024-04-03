/*
 Navicat Premium Data Transfer

 Source Server         : cp3z
 Source Server Type    : MySQL
 Source Server Version : 50744
 Source Host           : 172.0.10.18:3306
 Source Schema         : geely-cp3z

 Target Server Type    : MySQL
 Target Server Version : 50744
 File Encoding         : 65001

 Date: 03/04/2024 15:41:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_app_prompt
-- ----------------------------
DROP TABLE IF EXISTS `t_app_prompt`;
CREATE TABLE `t_app_prompt`  (
  `id` int(11) NOT NULL COMMENT '主键',
  `app_id` int(11) NULL DEFAULT NULL COMMENT '应用id',
  `app_tip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '提示文案',
  `sort` int(2) NULL DEFAULT NULL COMMENT '展示排序',
  `display` int(2) NULL DEFAULT 0 COMMENT '是否展示 0.不展示 1.展示',
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '应用注意说明表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_app_prompt
-- ----------------------------
INSERT INTO `t_app_prompt` VALUES (1, 0, '这是第一条，测试提示我文案哟。', 0, 1, '2024-04-03 15:38:36', '2024-04-03 15:38:36');
INSERT INTO `t_app_prompt` VALUES (2, 0, '这是第二条，测试提示我文案哟。', 1, 1, '2024-04-03 15:38:36', '2024-04-03 15:39:07');
INSERT INTO `t_app_prompt` VALUES (3, 0, '这是第三条，测试提示我文案哟。', 2, 1, '2024-04-03 15:38:36', '2024-04-03 15:39:11');
INSERT INTO `t_app_prompt` VALUES (4, 1, '这是第一条，测试提示我文案哟。', 0, 1, '2024-04-03 15:38:36', '2024-04-03 15:40:52');
INSERT INTO `t_app_prompt` VALUES (5, 1, '这是第二条，测试提示我文案哟。', 1, 1, '2024-04-03 15:38:36', '2024-04-03 15:40:54');
INSERT INTO `t_app_prompt` VALUES (6, 2, '这是第一条，测试提示我文案哟。', 0, 1, '2024-04-03 15:38:36', '2024-04-03 15:40:57');

SET FOREIGN_KEY_CHECKS = 1;
