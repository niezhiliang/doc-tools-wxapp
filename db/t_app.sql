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

 Date: 03/04/2024 15:41:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_app
-- ----------------------------
DROP TABLE IF EXISTS `t_app`;
CREATE TABLE `t_app`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `app_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '程序名称',
  `app_icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '展示图片地址',
  `app_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '点击跳转地址',
  `display` int(2) NULL DEFAULT 0 COMMENT '是否展示 0.不展示 1.展示',
  `app_group_id` int(11) NULL DEFAULT NULL COMMENT '分组id',
  `max_size` int(11) NULL DEFAULT 5 COMMENT '文件上传限制MB',
  `sort` int(5) NULL DEFAULT NULL COMMENT '展示顺序',
  `create_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '应用表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_app
-- ----------------------------
INSERT INTO `t_app` VALUES (0, 'PDF转图片', '/imgs/pdf.png', '/pages/upload/upload?type=0', 1, 1, 5, 0, '2024-04-03 15:30:04', '2024-04-03 15:36:21');
INSERT INTO `t_app` VALUES (1, 'PDF转WORD', '/imgs/img.png', '/pages/upload/upload?type=1', 1, 1, 5, 1, '2024-04-03 15:31:51', '2024-04-03 15:36:23');
INSERT INTO `t_app` VALUES (2, '图片转PDF', '/imgs/img.png', '/pages/upload/upload?type=2', 1, 1, 5, 2, '2024-04-03 15:32:19', '2024-04-03 15:36:26');
INSERT INTO `t_app` VALUES (3, 'WORD转PDF', '/imgs/WORD.png', '/pages/upload/upload?type=3', 1, 1, 5, 3, '2024-04-03 15:32:29', '2024-04-03 15:36:29');
INSERT INTO `t_app` VALUES (4, 'PPT转PDF', '/imgs/PPT.png', '/pages/upload/upload?type=4', 1, 1, 5, 4, '2024-04-03 15:32:49', '2024-04-03 15:37:10');
INSERT INTO `t_app` VALUES (5, 'EXCLE转PDF', '/imgs/excel.png', '/pages/upload/upload?type=5', 1, 1, 5, 5, '2024-04-03 15:33:04', '2024-04-03 15:36:37');

SET FOREIGN_KEY_CHECKS = 1;
