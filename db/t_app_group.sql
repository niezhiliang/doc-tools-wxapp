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

 Date: 03/04/2024 15:42:02
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_app_group
-- ----------------------------
DROP TABLE IF EXISTS `t_app_group`;
CREATE TABLE `t_doc_group`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `group_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分组名称',
  `sort` int(255) NULL DEFAULT NULL COMMENT '排列顺序',
  `display` int(255) NULL DEFAULT 0 COMMENT '是否展示 0.不展示 1.展示',
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '应用分组表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_app_group
-- ----------------------------
INSERT INTO `t_app_group` VALUES (1, '文档工具', 1, 1, '2024-04-03 15:24:53', '2024-04-03 15:24:53');

SET FOREIGN_KEY_CHECKS = 1;
