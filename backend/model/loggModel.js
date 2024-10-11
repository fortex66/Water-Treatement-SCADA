const sequelize = require("../config/databaseConfig");
const { DataTypes } = require("sequelize");

// alarm table
const log = sequelize.define(
  "logging",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    value1: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    value2: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    value3: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },
  {
    // 다른 옵션들 기입
    timestamps: false, // 기본 옵션으로 선택되는 설정을 취소하기 위해
    sequelize,
    modelName: "logging",
    tableName: "logging",
  }
);

const logIndex=sequelize.define(
  "logIndex",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    lastIndex: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
  {
    // 다른 옵션들 기입
    timestamps: false, // 기본 옵션으로 선택되는 설정을 취소하기 위해
    sequelize,
    modelName: "logIndex",
    tableName: "logIndex",
  }
);
module.exports = { log, logIndex };
