using Microsoft.EntityFrameworkCore.Migrations;

namespace ChatAppProject.Migrations
{
    public partial class SignAndVerifyMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "signedMessage",
                table: "Messages",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "signedMessage",
                table: "Messages");
        }
    }
}
