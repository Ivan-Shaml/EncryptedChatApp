using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatAppProject.Data.Migrations
{
    public partial class E2EE : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_IdentityUserId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_IdentityUserId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "IdentityUserId",
                table: "Messages");

            migrationBuilder.AddColumn<string>(
                name: "RecepientUserId",
                table: "Messages",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SenderUserIdId",
                table: "Messages",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PublicKeys",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(nullable: false),
                    PublicKey = table.Column<string>(nullable: true),
                    DateAdded = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublicKeys_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderUserIdId",
                table: "Messages",
                column: "SenderUserIdId");

            migrationBuilder.CreateIndex(
                name: "IX_PublicKeys_UserId",
                table: "PublicKeys",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_SenderUserIdId",
                table: "Messages",
                column: "SenderUserIdId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_AspNetUsers_SenderUserIdId",
                table: "Messages");

            migrationBuilder.DropTable(
                name: "PublicKeys");

            migrationBuilder.DropIndex(
                name: "IX_Messages_SenderUserIdId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "RecepientUserId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "SenderUserIdId",
                table: "Messages");

            migrationBuilder.AddColumn<string>(
                name: "IdentityUserId",
                table: "Messages",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_IdentityUserId",
                table: "Messages",
                column: "IdentityUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_AspNetUsers_IdentityUserId",
                table: "Messages",
                column: "IdentityUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
